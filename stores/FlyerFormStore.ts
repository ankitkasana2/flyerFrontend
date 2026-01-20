import { makeAutoObservable, toJS, runInAction } from "mobx"
import { getApiUrl } from "@/config/api"

type Flyer = {
  id: string
  name: string
  category: string
  price: number
  priceType: "basic" | "regular" | "premium"
  hasPhotos: boolean
  imageUrl: string
  image_url?: string
  form_type?: string
  tags: string[]
  isRecentlyAdded?: boolean
  isFeatured?: boolean
}

// flyer form detail
export type FlyerFormDetails = {
  flyerId?: string
  categoryId?: string
  userId?: string
  eventDetails: {
    presenting: string
    mainTitle: string
    date: Date | null
    flyerInfo?: string
    addressAndPhone?: string
    venueLogo?: File | string | null
    venueText: string
  }

  djsOrArtists: {
    name: string
    image?: File | string | null
  }[]

  host: {
    name: string
    image?: File | string | null
  }[]

  sponsors: {
    sponsor1?: File | string | null
    sponsor2?: File | string | null
    sponsor3?: File | string | null
  }

  extras: {
    storySizeVersion: boolean
    customFlyer: boolean
    animatedFlyer: boolean
    instagramPostSize: boolean
  }


  deliveryTime: string

  customNote?: string

  subtotal?: number

  // Birthday-specific fields
  birthdayPersonPhoto?: File | string | null
  isBirthdayForm?: boolean
}

export class FlyerFormStore {
  flyer: Flyer | null = null
  similarFlyers: Flyer[] = []
  basePrice = 0
  loading = false
  flyerFormDetail: FlyerFormDetails = {
    flyerId: "",
    categoryId: "",
    userId: "",
    eventDetails: {
      presenting: "",
      mainTitle: "",
      date: null,
      flyerInfo: "",
      addressAndPhone: "",
      venueLogo: null,
      venueText: '',
    },
    djsOrArtists: [
      { name: "", image: null },
      { name: "", image: null },
    ],
    host: [{ name: "", image: null }],
    sponsors: { sponsor1: null, sponsor2: null, sponsor3: null },
    extras: {
      storySizeVersion: false,
      customFlyer: false,
      animatedFlyer: false,
      instagramPostSize: true,
    },
    deliveryTime: "",
    customNote: "",
    subtotal: 0,
  }

  constructor() {
    makeAutoObservable(this)
  }

  
  async fetchFlyer(id: string, refreshSimilar = true) {
    runInAction(() => {
      this.loading = true
    })
    try {
      const res = await fetch(getApiUrl(`/api/flyers/${id}`), {
        cache: "no-store",
      });

      const data = await res.json();

      runInAction(() => {

        // FIX PRICE
        const rawPrice = data.price;
        const numericPrice = rawPrice
          ? Number(String(rawPrice).replace(/[^0-9.]/g, ""))
          : null;



        this.flyer = {
          ...data,
          name: data.title,               // FIX NAME
          image_url: data.image_url,      // FIX IMAGE
          price: numericPrice || 0,        // Store parsed numeric price
        };

        if (numericPrice !== null && !Number.isNaN(numericPrice)) {
          this.basePrice = numericPrice;
        } else {
        }

        // FIX FLYER ID
        this.flyerFormDetail.flyerId = data.id;

        // FIX CATEGORY
        this.flyerFormDetail.categoryId =
          data.categories?.[0] ?? this.flyerFormDetail.categoryId;

        // Fetch similar flyers only if requested
        if (refreshSimilar) {
          this.fetchSimilarFlyers();
        }
        this.loading = false;
      });
    } catch (err) {
      console.error("Failed to load flyer:", err);
      runInAction(() => {
        this.loading = false;
      });
    }
  }




  async fetchSimilarFlyers() {
    const flyer = this.flyer
    if (!flyer) return


    try {
      // Get categories from the current flyer
      const flyerCategories = Array.isArray((flyer as any).categories)
        ? (flyer as any).categories
        : [flyer.category];

      // Fetch all flyers from API
      const response = await fetch(getApiUrl('/api/flyers'));
      const allFlyers = await response.json();

      // Filter flyers that share at least one category with the current flyer
      const filteredFlyers = allFlyers.filter((f: any) => {
        const fCategories = Array.isArray(f.categories)
          ? f.categories
          : [f.category];

        // Check if there's any overlap in categories
        const hasCommonCategory = flyerCategories.some((cat: string) =>
          fCategories.includes(cat)
        );

        return hasCommonCategory && f.id !== flyer.id;
      });

      runInAction(() => {
        this.similarFlyers = filteredFlyers.map((f: any) => ({
          ...f,
          name: f.title, // Map title to name for UI
          price: typeof f.price === 'string' ? Number(f.price.replace(/[^0-9.]/g, "")) : f.price
        }));
      });

    } catch (error) {
      console.error("Error fetching similar flyers:", error);
      // If API fails, return empty list
      this.similarFlyers = [];
    }
  }

  // -----------------------------
  // 2️⃣ Event Details
  // -----------------------------
  updateEventDetails(key: keyof FlyerFormDetails["eventDetails"], value: any) {
    this.flyerFormDetail.eventDetails[key] = value
  }

  // -----------------------------
  // 3️⃣ DJs / Artists
  // -----------------------------
  updateDJ(
    index: number,
    key: keyof FlyerFormDetails["djsOrArtists"][number],
    value: string | File | null
  ) {
    this.flyerFormDetail.djsOrArtists[index][key] = value as any
  }

  addDJ() {
    if (this.flyerFormDetail.djsOrArtists.length < 4) {
      this.flyerFormDetail.djsOrArtists.push({ name: "", image: null })
    }
  }

  removeDJ(index: number) {
    this.flyerFormDetail.djsOrArtists.splice(index, 1)
  }

  // -----------------------------
  // 4️⃣ Host
  // -----------------------------
  updateHost(
    index: number,
    key: "name" | "image",
    value: string | File | null
  ) {
    if (this.flyerFormDetail.host && this.flyerFormDetail.host[index]) {
      this.flyerFormDetail.host[index][key] = value as any
    }
  }

  addHost() {
    if (!this.flyerFormDetail.host) {
      this.flyerFormDetail.host = [{ name: "", image: null }]
    } else if (this.flyerFormDetail.host.length < 2) {
      this.flyerFormDetail.host.push({ name: "", image: null })
    }
  }

  removeHost(index: number) {
    if (this.flyerFormDetail.host && this.flyerFormDetail.host.length > 1) {
      this.flyerFormDetail.host.splice(index, 1)
    }
  }

  // -----------------------------
  // 5️⃣ Sponsors
  // -----------------------------
  updateSponsor(
    key: keyof FlyerFormDetails["sponsors"],
    file: File | string | null
  ) {
    this.flyerFormDetail.sponsors[key] = file
  }

  // -----------------------------
  // 6️⃣ Extras
  // -----------------------------
  toggleExtra(key: keyof FlyerFormDetails["extras"]) {
    this.flyerFormDetail.extras[key] = !this.flyerFormDetail.extras[key]
  }

  // -----------------------------
  // 7️⃣ Delivery Time
  // -----------------------------
  updateDeliveryTime(value: string) {
    this.flyerFormDetail.deliveryTime = value
  }

  // -----------------------------
  // 8️⃣ Custom Note
  // -----------------------------
  updateCustomNote(value: string) {
    this.flyerFormDetail.customNote = value
  }

  setUserId(userId: string | null) {
    this.flyerFormDetail.userId = userId ?? ""
  }

  setFlyerId(flyerId: string | null | undefined) {
    if (flyerId) {
      this.flyerFormDetail.flyerId = flyerId
    }
  }

  setCategoryId(categoryId: string | null | undefined) {
    if (categoryId) {
      this.flyerFormDetail.categoryId = categoryId
    }
  }

  setBasePrice(price: number | null | undefined) {
    if (typeof price === "number" && !Number.isNaN(price)) {
      this.basePrice = price
    }
  }


  // subtotal 
  get subtotal() {
    const flyerPrice = this.flyer?.price ?? this.basePrice ?? 0
    let total = flyerPrice;

    // Extras pricing
    const extrasPricing: Record<keyof FlyerFormDetails["extras"], number> = {
      storySizeVersion: 10,
      customFlyer: 10,
      animatedFlyer: 25,
      instagramPostSize: 0,
    };

    for (const key in this.flyerFormDetail.extras) {
      if (this.flyerFormDetail.extras[key as keyof FlyerFormDetails["extras"]]) {
        total += extrasPricing[key as keyof FlyerFormDetails["extras"]];
      }
    }

    // Delivery time pricing
    const deliveryPricing: Record<string, number> = {
      "1hour": 20,
      "5hours": 10,
      "24hours": 0,
    };

    total += deliveryPricing[this.flyerFormDetail.deliveryTime] ?? 0;

    this.flyerFormDetail.subtotal = total

    return total;
  }


  // -----------------------------
  // 9️⃣ Validate form
  // -----------------------------
  validateForm(): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    const event = this.flyerFormDetail.eventDetails
    const delivery = this.flyerFormDetail.deliveryTime

    // ✅ REQUIRED: Event Date
    if (!event.date) {
      errors.push("Event Date is required.")
    }

    // ✅ REQUIRED: Delivery Time
    if (!delivery || delivery.trim() === "") {
      errors.push("Please select a delivery time.")
    }

    // ℹ️ All other fields are OPTIONAL:
    // - Event Title
    // - Presenting
    // - Flyer Information
    // - Address & Phone
    // - Venue Logo/Text
    // - DJs/Artists
    // - Hosts

    return { valid: errors.length === 0, errors }
  }

}
