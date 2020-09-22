import request from "supertest";
import mongoose from "mongoose";
import { Ticket, TicketDoc } from "../../models/ticket";
import { Order } from "../../models/order";
import { app } from "../../app";
import { signin } from "../../test/setup";

const createTicket = async (): Promise<TicketDoc> => {
  const ticket = Ticket.build({ price: 133, title: "ticket" });
  await ticket.save();
  return ticket;
};

it("should fetch specific user orders", async (): Promise<void> => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = signin();
  const userTwo = signin();

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne._id })
    .expect(201);
  await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo._id })
    .expect(201);
  await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree._id })
    .expect(201);

  const res = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);
  console.log(res.body[0].ticket.id);
  expect(res.body[0].ticket.id).toEqual(ticketTwo._id);
  expect(res.body[1].ticket.id).toEqual(ticketThree._id);
});
