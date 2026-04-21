import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.post('/api/orders', async (req, res) => {
  try {
    const { customerName, phone, email, comment, items } = req.body;

    if (!customerName || !phone || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Некорректные данные заказа' });
    }

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);

    const order = {
      id: Date.now(),
      customerName,
      phone,
      email,
      comment,
      items,
      totalAmount
    };

    await sendLeadToAmoCRM(order);
    await sendOrderTo1C(order);

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ message: 'Ошибка обработки заказа' });
  }
});

async function sendLeadToAmoCRM(order) {
  const amo = axios.create({
    baseURL: `${process.env.AMOCRM_BASE_URL}/api/v4`,
    headers: {
      Authorization: `Bearer ${process.env.AMOCRM_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const contactResponse = await amo.post('/contacts', [
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

  const contactId = contactResponse.data._embedded.contacts[0].id;

  await amo.post('/leads', [
    {
      name: `Заказ с сайта #${order.id}`,
      price: Number(order.totalAmount),
      pipeline_id: Number(process.env.AMOCRM_PIPELINE_ID),
      status_id: Number(process.env.AMOCRM_STATUS_ID),
      _embedded: {
        contacts: [{ id: contactId }]
      }
    }
  ]);
}

async function sendOrderTo1C(order) {
  await axios.post(
    `${process.env.ONEC_API_URL}/orders`,
    order,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.ONEC_API_KEY
      }
    }
  );
}

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server started on http://localhost:${process.env.PORT || 4000}`);
});