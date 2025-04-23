import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";
import prisma from "@/lib/prisma";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

    const now = new Date();
    const formattedDateTime = now.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const contacts = await prisma.contact.findMany();

    if (contacts.length === 0) {
      return NextResponse.json(
        { message: "No emergency contacts found" },
        { status: 200 }
      );
    }

    const message = `EMERGENCY SOS ALERT! I need immediate help. My current location : ${googleMapsLink} (sent at ${formattedDateTime})`;

    const smsPromises = contacts.map((contact: { phoneNumber: any }) => {
      return twilioClient.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: contact.phoneNumber,
      });
    });

    await Promise.all(smsPromises);

    return NextResponse.json({
      success: true,
      message: "SOS alert sent to all emergency contacts",
      contactsNotified: contacts.length,
    });
  } catch (error) {
    console.error("SOS API error:", error);
    return NextResponse.json(
      { error: "Failed to send SOS messages" },
      { status: 500 }
    );
  }
}
