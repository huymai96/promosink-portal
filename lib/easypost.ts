import EasyPost from "@easypost/api";

const apiKey = process.env.EASYPOST_API_KEY || "";

let client: EasyPost.Client | null = null;

function getClient(): EasyPost.Client | null {
  if (!client) {
    if (!apiKey) {
      return null; // Gracefully return null if no API key
    }
    client = new EasyPost.Client(apiKey);
  }
  return client;
}

export interface ShippingAddress {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}

export interface Package {
  weight: number; // in oz
  length?: number; // in inches
  width?: number;
  height?: number;
}

export interface ShippingOption {
  service: string;
  carrier: string;
  rate: number;
  estimatedDays?: number;
  id: string;
}

/**
 * Get shipping rates from EasyPost
 */
export async function getShippingRates(
  fromAddress: ShippingAddress,
  toAddress: ShippingAddress,
  packages: Package[]
): Promise<ShippingOption[]> {
  const client = getClient();
  
  // Return mock data if API key not configured
  if (!client) {
    console.log("EasyPost API key not configured, using demo data");
    return [
      {
        service: "Ground",
        carrier: "UPS",
        rate: 15.99,
        estimatedDays: 5,
        id: "rate_demo_1",
      },
      {
        service: "2Day",
        carrier: "FedEx",
        rate: 35.99,
        estimatedDays: 2,
        id: "rate_demo_2",
      },
      {
        service: "Overnight",
        carrier: "FedEx",
        rate: 55.99,
        estimatedDays: 1,
        id: "rate_demo_3",
      },
    ];
  }

  try {

    // Create from address
    const from = await client.Address.create({
      name: fromAddress.name,
      street1: fromAddress.street1,
      street2: fromAddress.street2,
      city: fromAddress.city,
      state: fromAddress.state,
      zip: fromAddress.zip,
      country: fromAddress.country || "US",
    });

    // Create to address
    const to = await client.Address.create({
      name: toAddress.name,
      street1: toAddress.street1,
      street2: toAddress.street2,
      city: toAddress.city,
      state: toAddress.state,
      zip: toAddress.zip,
      country: toAddress.country || "US",
    });

    // Create parcels
    const parcels = await Promise.all(
      packages.map((pkg) =>
        client.Parcel.create({
          weight: pkg.weight,
          length: pkg.length || 10,
          width: pkg.width || 10,
          height: pkg.height || 2,
        })
      )
    );

    // Create shipment
    const shipment = await client.Shipment.create({
      from_address: from,
      to_address: to,
      parcel: parcels[0], // EasyPost requires single parcel, but we can create multiple shipments if needed
    });

    // Get rates
    const rates = shipment.rates || [];

    return rates.map((rate) => ({
      service: rate.service || "",
      carrier: rate.carrier || "",
      rate: parseFloat(rate.rate || "0"),
      estimatedDays: rate.est_delivery_days
        ? parseInt(rate.est_delivery_days)
        : undefined,
      id: rate.id || "",
    }));
  } catch (error) {
    console.error("EasyPost API error:", error);
    // Return mock data for development
    return [
      {
        service: "Ground",
        carrier: "UPS",
        rate: 15.99,
        estimatedDays: 5,
        id: "rate_mock_1",
      },
      {
        service: "2Day",
        carrier: "FedEx",
        rate: 35.99,
        estimatedDays: 2,
        id: "rate_mock_2",
      },
    ];
  }
}

