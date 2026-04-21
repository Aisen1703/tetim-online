const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const {
  AMOCRM_SUBDOMAIN,
  AMOCRM_CLIENT_ID,
  AMOCRM_CLIENT_SECRET,
  AMOCRM_REDIRECT_URI,
  AMOCRM_REFRESH_TOKEN,
  AMOCRM_PIPELINE_ID,
  AMOCRM_STATUS_ID
} = process.env;

let accessToken = null;
let refreshToken = AMOCRM_REFRESH_TOKEN;
let tokenExpiresAt = 0;

function getBaseUrl() {
  return `https://${AMOCRM_SUBDOMAIN}.amocrm.ru`;
}

function getApiClient() {
  return axios.create({
    baseURL: `${getBaseUrl()}/api/v4`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

async function ensureAccessToken() {
  const now = Date.now();

  if (accessToken && now < tokenExpiresAt - 60_000) {
    return accessToken;
  }

  const response = await axios.post(`${getBaseUrl()}/oauth2/access_token`, {
    client_id: AMOCRM_CLIENT_ID,
    client_secret: AMOCRM_CLIENT_SECRET,
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    redirect_uri: AMOCRM_REDIRECT_URI
  });

  accessToken = response.data.access_token;
  refreshToken = response.data.refresh_token || refreshToken;
  tokenExpiresAt = now + Number(response.data.expires_in || 3600) * 1000;

  return accessToken;
}

async function findContactByPhone(phone) {
  await ensureAccessToken();
  const api = getApiClient();
  const normalized = normalizePhone(phone);

  if (!normalized) return null;

  const response = await api.get('/contacts', {
    params: {
      query: normalized,
      limit: 50,
      with: 'leads'
    }
  });

  const contacts = response.data?._embedded?.contacts || [];

  return contacts.find((contact) => {
    const fields = contact.custom_fields_values || [];
    return fields.some((field) => {
      if (field.field_code !== 'PHONE') return false;
      return (field.values || []).some((value) => normalizePhone(value.value) === normalized);
    });
  }) || null;
}

async function createContact(order) {
  await ensureAccessToken();
  const api = getApiClient();

  const response = await api.post('/contacts', [
    {
      name: order.customerName,
      custom_fields_values: [
        {
          field_code: 'PHONE',
          values: [{ value: order.phone }]
        },
        ...(order.email
          ? [{
              field_code: 'EMAIL',
              values: [{ value: order.email }]
            }]
          : [])
      ]
    }
  ]);

  return response.data._embedded.contacts[0];
}

async function getOrCreateContact(order) {
  const existing = await findContactByPhone(order.phone);
  if (existing) return existing;
  return createContact(order);
}

async function createLead(order, contactId) {
  await ensureAccessToken();
  const api = getApiClient();

  const leadResponse = await api.post('/leads', [
    {
      name: `Заказ с сайта ${new Date().toLocaleDateString('ru-RU')}`,
      price: Number(order.totalAmount || 0),
      pipeline_id: Number(AMOCRM_PIPELINE_ID),
      status_id: Number(AMOCRM_STATUS_ID),
      _embedded: {
        contacts: [{ id: Number(contactId) }]
      }
    }
  ]);

  const lead = leadResponse.data._embedded.leads[0];

  const itemsText = (order.items || [])
    .map((item) => `${item.name} × ${item.quantity}`)
    .join(', ');

  await api.post('/leads/notes', [
    {
      entity_id: lead.id,
      note_type: 'common',
      params: {
        text: [
          `Имя: ${order.customerName}`,
          `Телефон: ${order.phone}`,
          order.email ? `Email: ${order.email}` : null,
          order.comment ? `Комментарий: ${order.comment}` : null,
          itemsText ? `Состав заказа: ${itemsText}` : null
        ].filter(Boolean).join('\n')
      }
    }
  ]);

  return lead;
}

async function sendOrderToAmoCRM(order) {
  const contact = await getOrCreateContact(order);
  const lead = await createLead(order, contact.id);
  return { contact, lead };
}

module.exports = {
  sendOrderToAmoCRM
};