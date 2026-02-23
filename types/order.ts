export interface DJ {
  name: string;
  // Add other DJ properties as needed
}

export interface Host {
  name: string;
  // Add other host properties as needed
}

export interface Sponsor {
  name: string;
  // Add other sponsor properties as needed
}

export interface OrderFormData {
  presenting: string;
  event_title: string;
  event_date: string;
  address_phone: string;
  flyer_info: string;
  custom_notes: string;
  delivery_time: string;
  email: string;
  story_size_version: boolean;
  custom_flyer: boolean;
  animated_flyer: boolean;
  instagram_post_size: boolean;
  flyer_is: number;
  category_id: number;
  user_id: string;
  total_price: number;
  subtotal: number;
  image_url: string;
  web_user_id?: string;
  djs: DJ[];
  host: Host;
  sponsors: Sponsor[];
}

export interface OrderFiles {
  venueLogoFile: File | null
    venueLogoUrl?: string | null    // ← ADD KARO - library URL ke liye
    hostFile: File | null
   
      djFiles: File[]
  djUrls?: (string | null)[]  // ← NEW
    sponsorFiles: File[]
    sponsorUrls?: (string | null)[] // ← ADD KARO - sponsor library URLs ke liye
}

export interface OrderSubmission {
  formData: OrderFormData;
  files: OrderFiles;
  userId: string;
  userEmail: string;
}
