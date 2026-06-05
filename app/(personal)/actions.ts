'use server';

export async function verifyPersonalPin(pin: string) {
  // This runs securely on the server! The PIN is never exposed to the frontend bundle.
  // You can override this by adding PERSONAL_PIN=your_new_pin to .env.local
  const correctPin = process.env.PERSONAL_PIN || '240622';
  
  return pin === correctPin;
}
