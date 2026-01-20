"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Upload,
  Music,
  Check,
  TestTube,
  ImageIcon,
} from "lucide-react";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { toJS } from "mobx";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import SponsorsBlock from "./sponser";
import ExtrasBlock from "./extra-block";
import DeliveryTimeBlock from "./delivery-time-block";
import { FlyersCarousel } from "../home/FlyersCarousel";
import HostSection from "./host-block";
import EventDetails from "./event-details";
import { FlyerRibbon } from "./flyer-ribbon";
import BirthdayForm from "./birthday-form";
import NoPhotoForm from "./no-photo-form";
import Photo10Form from "./photo-10-form";
import Photo15Form from "./photo-15-form";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "sonner"
import { useSearchParams, useParams } from "next/navigation";
import { getApiUrl } from "@/config/api";
import type { FlyerFormDetails } from "@/stores/FlyerFormStore";
import { saveToTemp } from "@/lib/uploads";
import { createCartFormData, setUserIdInFormData } from "@/lib/cart";
import { MediaLibraryDialog } from "../upload/media-library-dialog";
import { LibraryItem } from "@/lib/uploads";
import { saveRecentItem } from "@/lib/autofill";
import { RecentSuggestions } from "@/components/ui/recent-suggestions";

// Cart fetching function
const fetchCartByUserId = async (userId: string) => {
  try {
    const response = await fetch(`${getApiUrl()}/api/cart/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.status}`);
    }

    const cartData = await response.json();
    return cartData;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Item {
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: Item[];
}


type Flyer = {
  id: string;
  name: string;
  category: string;
  price: number;
  priceType: "basic" | "regular" | "premium";
  hasPhotos: boolean;
  form_type?: string; // "With Photo" | "No Photo" | "Birthday"
  imageUrl: string;
  image_url?: string;
  category_id?: string;
  tags: string[];
  isRecentlyAdded?: boolean;
  isFeatured?: boolean;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const formatCurrency = (value: number | string | null | undefined) => {
  const numericValue = typeof value === "number" ? value : Number(value ?? 0);
  if (Number.isNaN(numericValue)) {
    return currencyFormatter.format(0);
  }
  return currencyFormatter.format(numericValue);
};

type CheckoutPayloadOptions = {
  userId?: string;
  flyerId?: string;
  categoryId?: string;
  subtotal?: number;
  image_url?: string;
};

const mapToApiRequest = (
  data: FlyerFormDetails,
  options: CheckoutPayloadOptions = {}
) => {
  const extras = data?.extras ?? {
    storySizeVersion: false,
    customFlyer: false,
    animatedFlyer: false,
    instagramPostSize: true
  };

  const sponsors = data?.sponsors ?? {};
  const normalizeSponsor = (file?: File | string | null) => ({
    name: (file instanceof File) ? file.name : (typeof file === 'string' ? "Sponsor" : "")
  });

  // Use REAL form data without fallbacks - only use fallbacks if data is truly empty
  return {
    presenting: data?.eventDetails?.presenting || "",
    event_title: data?.eventDetails?.mainTitle || "",

    event_date: data?.eventDetails?.date
      ? new Date(data.eventDetails.date).toISOString().split("T")[0]
      : "",

    flyer_info: data?.eventDetails?.flyerInfo || "",
    address_phone: data?.eventDetails?.addressAndPhone || "",

    djs: Array.isArray(data?.djsOrArtists)
      ? data.djsOrArtists.map((dj: any) => ({
        name: dj?.name || "",
        image_url: typeof dj.image === 'string' ? dj.image : ""
      }))
      : [],

    host: Array.isArray(data?.host)
      ? data.host.map((h) => ({
        name: h.name || "",
        image_url: typeof h.image === 'string' ? h.image : ""
      }))
      : [],

    sponsors: [
      { 
        name: normalizeSponsor(sponsors.sponsor1).name, 
        image_url: typeof sponsors.sponsor1 === 'string' ? sponsors.sponsor1 : "" 
      },
      { 
        name: normalizeSponsor(sponsors.sponsor2).name, 
        image_url: typeof sponsors.sponsor2 === 'string' ? sponsors.sponsor2 : "" 
      },
      { 
        name: normalizeSponsor(sponsors.sponsor3).name, 
        image_url: typeof sponsors.sponsor3 === 'string' ? sponsors.sponsor3 : "" 
      }
    ],

    story_size_version: extras.storySizeVersion ?? false,
    custom_flyer: extras.customFlyer ?? false,
    animated_flyer: extras.animatedFlyer ?? false,
    instagram_post_size: extras.instagramPostSize ?? false,

    custom_notes: data?.customNote || "",
    flyer_id: options.flyerId ?? data?.flyerId ?? "",
    category_id: options.categoryId ?? data?.categoryId ?? "",
    user_id: options.userId ?? data?.userId ?? "",
    subtotal: options.subtotal ?? 0,
    image_url: options.image_url || "",
    delivery_time: data?.deliveryTime || "24hours",
    total_price: options.subtotal ?? 0
  };
};

const EventBookingForm = () => {
  const searchParams = useSearchParams();
  const params = useParams();

  const image = searchParams.get("image");
  const name = searchParams.get("name");
  const priceFromQuery = Number(searchParams.get("price") ?? "0");
  const categoryFromQuery = searchParams.get("category") ?? undefined;
  const routeFlyerId =
    typeof params?.FlyerId === "string"
      ? params.FlyerId
      : Array.isArray(params?.FlyerId)
        ? params?.FlyerId[0]
        : undefined;

  const { flyerFormStore, cartStore, authStore } = useStore();

  // Auto-load cart data when user is logged in
  useEffect(() => {
    if (authStore.user?.id) {
      cartStore.load(authStore.user.id)
    }
  }, [authStore.user?.id, cartStore])

  const [flyer, setFlyer] = useState<Flyer | undefined>(undefined);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartData, setCartData] = useState<any>(null);
  const [djList, setDjList] = useState<{ id: number; name: string; image: string | null }[]>(() => {
    return [0].map((_, index) => ({
      id: index + 1,
      name: "",
      image: null
    }));
  });

  const [djListText, setDjListText] = useState<{ id: number; name: string }[]>(() => {
    return [0].map((_, index) => ({
      id: index + 1,
      name: ""
    }));
  });

  // Sync with store after mount to be SSR-safe
  useEffect(() => {
    const storeDJs = flyerFormStore.flyerFormDetail.djsOrArtists;
    if (storeDJs.length > 0) {
      setDjList(storeDJs.map((dj, index) => ({
        id: index + 1,
        name: dj.name,
        image: (dj.image instanceof File) ? URL.createObjectURL(dj.image) : (typeof dj.image === 'string' ? dj.image : null)
      })));
      setDjListText(storeDJs.map((dj, index) => ({
        id: index + 1,
        name: dj.name
      })));
    }
  }, [flyerFormStore.flyerFormDetail.djsOrArtists]);

  // ✅ MULTIPLE SELECTION STATE
  const [selectedFlyerIds, setSelectedFlyerIds] = useState<string[]>([]);

  // Sync selected IDs when main flyer loads
  useEffect(() => {
    if (flyer?.id) {
      setSelectedFlyerIds(prev => {
        if (!prev.includes(flyer.id)) return [...prev, flyer.id];
        return prev;
      });
    }
  }, [flyer?.id]);

  const flyerImage = flyer?.image_url || flyer?.imageUrl || image || "/placeholder.svg";
  const flyerName = flyer?.name || name || "";
  const basePrice = flyerFormStore.basePrice ?? flyer?.price ?? priceFromQuery;

  // Calculate total for multiple flyers
  const additionalFlyersPrice = selectedFlyerIds
    .filter(id => id !== flyer?.id) // Exclude current active flyer (already in basePrice)
    .reduce((sum, id) => {
      // Find flyer in similarFlyers to get its price
      const found = flyerFormStore.similarFlyers.find(f => String(f.id) === String(id)) as any;
      const priceStr = found ? found.price : 0;
      const price = typeof priceStr === 'number' ? priceStr : Number(String(priceStr || 0).replace('$', ''));
      return sum + price;
    }, 0);

  const computedSubtotal = flyerFormStore.subtotal;
  const totalDisplay = (computedSubtotal > 0 ? computedSubtotal : basePrice) + additionalFlyersPrice;

  // Debug logging
    routeFlyerId,
    basePrice: flyerFormStore.basePrice,
    flyerPrice: flyer?.price,
    priceFromQuery,
    totalDisplay,
    flyer: flyer
  });

  useEffect(() => {
    if (routeFlyerId) {
      flyerFormStore.setFlyerId(routeFlyerId);
      flyerFormStore.fetchFlyer(routeFlyerId);
    }
  }, [routeFlyerId, flyerFormStore]);

  useEffect(() => {
    const categoryId =
      (flyer as any)?.category_id ??
      flyer?.category ??
      categoryFromQuery;

    if (categoryId) {
      flyerFormStore.setCategoryId(String(categoryId));
    }
  }, [flyer, categoryFromQuery, flyerFormStore]);

  // ✅ Reset local state when flyer ID changes (for Default form)
  useEffect(() => {
    setDjList([
      { id: 1, name: "", image: null },
      { id: 2, name: "", image: null },
    ]);
    setDjListText([
      { id: 1, name: "" },
      { id: 2, name: "" },
    ]);
    setNote("");
  }, [routeFlyerId]);

  // Fetch cart data when user is logged in
  useEffect(() => {
    const loadCartData = async () => {
      if (authStore.user?.id) {
        try {
          const cart = await fetchCartByUserId(authStore.user.id);
          setCartData(cart);
        } catch (error) {
          console.error('Failed to load cart data:', error);
          toast.error('Failed to load cart data');
        }
      }
    };

    loadCartData();
  }, [authStore.user?.id]);

  // Function to manually refresh cart data
  const refreshCartData = async () => {
    if (!authStore.user?.id) {
      toast.error('Please log in to view cart');
      return;
    }

    try {
      const cart = await fetchCartByUserId(authStore.user.id);
      setCartData(cart);
      toast.success('Cart data refreshed');
    } catch (error) {
      console.error('Failed to refresh cart data:', error);
      toast.error('Failed to refresh cart data');
    }
  };



  // ✅ Handle DJ name change
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    flyerFormStore.updateDJ(index, "name", e.target.value)


    // 3️⃣ Update local UI preview (if you’re using local state for preview)
    const isPhotoForm = flyer?.form_type === "With Photo" || flyer?.hasPhotos;
    if (isPhotoForm) {
      setDjList((prev) => {
        const newList = [...prev];
        newList[index] = { ...newList[index], name: e.target.value };
        return newList;
      })
    } else {
      setDjListText((prev) => {
        const newList2 = [...prev];
        newList2[index] = { ...newList2[index], name: e.target.value };
        return newList2;
      })
    }
  }

  // ✅ Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // 1️⃣ Update the MobX store with the raw File
      flyerFormStore.updateDJ(index, "image", file);

      // 2️⃣ Create a preview using FileReader
      const reader = new FileReader();
      reader.onload = () => {
        // 3️⃣ Update local UI preview (if you’re using local state for preview)
        setDjList((prev) => {
          const newList = [...prev];
          newList[index] = { ...newList[index], image: reader.result as string };
          return newList;
        });
      };
      reader.readAsDataURL(file); // 4️⃣ Convert file → base64
    }
  };

  // ✅ Handle library selection
  const handleLibrarySelect = (items: LibraryItem[], index: number) => {
    if (items.length > 0) {
      const item = items[0];
      // 1️⃣ Update the MobX store with the URL
      flyerFormStore.updateDJ(index, "image", item.dataUrl);

      // 2️⃣ Update local UI preview
      setDjList((prev) => {
        const newList = [...prev];
        newList[index] = { ...newList[index], image: item.dataUrl };
        return newList;
      });
    }
  };


  // ✅ Remove image
  const handleRemoveImage = (index: number) => {
    flyerFormStore.updateDJ(index, "image", null)
    setDjList((prev) => {
      const newList = [...prev];
      newList[index] = { ...newList[index], image: null };
      return newList;
    });
  }

  // ✅ Add new DJ field (max 4)
  const handleAddField = () => {
    const isPhotoForm = flyer?.form_type === "With Photo" || flyer?.hasPhotos;

    if (isPhotoForm) {
      if (djList.length >= 4) {
        toast.error("Maximum 4 DJs allowed");
        return;
      }
      flyerFormStore.addDJ()
      setDjList(prev => [...prev, { id: prev.length + 1, name: "", image: null }])
    } else {
      if (djListText.length >= 4) {
        toast.error("Maximum 4 DJs allowed");
        return;
      }
      flyerFormStore.addDJ()
      setDjListText(prev => [...prev, { id: prev.length + 1, name: '' }])
    }
  }

  const handleRemoveField = (index: number) => {
    flyerFormStore.removeDJ(index);
    const isPhotoForm = flyer?.form_type === "With Photo" || flyer?.hasPhotos;

    if (isPhotoForm) {
      setDjList(prev => prev.filter((_, i) => i !== index).map((dj, i) => ({ ...dj, id: i + 1 })));
    } else {
      setDjListText(prev => prev.filter((_, i) => i !== index).map((dj, i) => ({ ...dj, id: i + 1 })));
    }
  };


  useEffect(() => {
    // whenever store.flyer changes, update local state
    setFlyer(flyerFormStore.flyer ?? undefined);
  }, [flyerFormStore.flyer]);

  // Detect if this is a Birthday category flyer
  const isBirthdayCategory =
    flyer?.form_type === 'Birthday' ||
    flyer?.category === 'Birthday' ||
    (Array.isArray((flyer as any)?.categories) && (flyer as any).categories.includes('Birthday')) ||
    categoryFromQuery === 'Birthday';

  // Debug logging
    form_type: flyer?.form_type,
    category: flyer?.category,
    categoryFromQuery,
    isBirthdayCategory
  });

  // If Birthday category, render Birthday form instead
  if (isBirthdayCategory) {
    return <BirthdayForm key={flyer?.id || routeFlyerId} flyer={flyer} />;
  }



  // Detect form type based on price and category
  const flyerPrice = flyer?.price || priceFromQuery || 0;
  const flyerCategory = flyer?.category || categoryFromQuery || "";
  const flyerFormType = flyer?.form_type || "";

  // Check if it's a With Photo form
  const isWithPhotoForm =
    flyerFormType === "With Photo" ||
    flyerCategory.toLowerCase().includes("with photo") ||
    flyerCategory.toLowerCase().includes("photo") ||
    (flyer as any)?.hasPhotos === true;

  // Debug logging for form routing
    flyerPrice,
    flyerPriceType: typeof flyerPrice,
    flyerCategory,
    flyerFormType,
    hasPhotos: (flyer as any)?.hasPhotos,
    isWithPhotoForm
  });

  // Check if it's a No-Photo form ($10, $15, or $40 No-Photo)
  const isNoPhotoForm =
    flyerFormType === "No Photo" ||
    flyerCategory.toLowerCase().includes("no-photo") ||
    flyerCategory.toLowerCase().includes("no photo") ||
    flyerCategory.toLowerCase().includes("nophoto");

  // Route to No-Photo forms
  if (isNoPhotoForm) {
    if (Number(flyerPrice) === 10) {
      return <NoPhotoForm key={flyer?.id || routeFlyerId} flyer={flyer} fixedPrice={10} />;
    } else if (Number(flyerPrice) === 15) {
      return <NoPhotoForm key={flyer?.id || routeFlyerId} flyer={flyer} fixedPrice={15} />;
    } else if (Number(flyerPrice) === 40 || Number(flyerPrice) >= 40) {
      return <NoPhotoForm key={flyer?.id || routeFlyerId} flyer={flyer} fixedPrice={40} />;
    }
  }

  // Route to $10 With Photo form (partial photo support)
  if (isWithPhotoForm && Number(flyerPrice) === 10) {
    return <Photo10Form key={flyer?.id || routeFlyerId} flyer={flyer} />;
  }

  // Route to $15 With Photo form (full photo support)
  if (isWithPhotoForm && Number(flyerPrice) === 15) {
    return <Photo15Form key={flyer?.id || routeFlyerId} flyer={flyer} />;
  }

  // Default: Render regular form

 
  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    try {
      e.preventDefault();


      if (!authStore.user?.id) {
        toast.error("Please sign in to continue with checkout.");
        authStore.handleAuthModal();
        return;
      }


      const { valid, errors } = flyerFormStore.validateForm();
      if (!valid) {
        toast.error(errors.join("\n"));
        return;
      }


      setIsSubmitting(true);
      flyerFormStore.setUserId(authStore.user.id);

      // Debug: Log the actual form store data

      toast.info("Uploading images to temp storage...");

      // Track temp files to send to backend later
      const tempFiles: Record<string, string> = {};

      // 1. Upload Venue Logo to TEMP
      let venueLogoUrl = "";
      if (typeof flyerFormStore.flyerFormDetail.eventDetails.venueLogo === 'string') {
        venueLogoUrl = flyerFormStore.flyerFormDetail.eventDetails.venueLogo;
      } else if (flyerFormStore.flyerFormDetail.eventDetails.venueLogo instanceof File) {
        const res = await saveToTemp(flyerFormStore.flyerFormDetail.eventDetails.venueLogo, "venue_logo");
        if (res) {
          tempFiles['venue_logo'] = res.filepath;
          venueLogoUrl = res.filepath;
        }
      }

      // 2. Upload DJs to TEMP
      const djsWithUrls = await Promise.all(flyerFormStore.flyerFormDetail.djsOrArtists.map(async (dj, idx) => {
        let imageUrl = "";
        if (typeof dj.image === 'string') {
          imageUrl = dj.image;
        } else if (dj.image instanceof File) {
          const res = await saveToTemp(dj.image, `dj_${idx}`);
          if (res) {
            tempFiles[`dj_${idx}`] = res.filepath;
            imageUrl = res.filepath;
          }
        }
        return { name: dj.name, image_url: imageUrl };
      }));

      // 3. Upload Hosts to TEMP
      const hostsWithUrls = await Promise.all((flyerFormStore.flyerFormDetail.host || []).map(async (h, idx) => {
        let imageUrl = "";
        if (typeof h.image === 'string') {
          imageUrl = h.image;
        } else if (h.image instanceof File) {
          const res = await saveToTemp(h.image, `host_${idx}`);
          if (res) {
            tempFiles[`host_${idx}`] = res.filepath;
            imageUrl = res.filepath;
          }
        }
        return { name: h.name, image_url: imageUrl };
      }));

      // 4. Upload Sponsors to TEMP
      const sponsors = flyerFormStore.flyerFormDetail.sponsors;
      const sponsorData: Array<{ name: string; image_url: string }> = [];

      const processSponsor = async (sponsor: File | string | null | undefined, idx: number) => {
        if (typeof sponsor === 'string') {
          return { name: `Sponsor ${idx + 1}`, image_url: sponsor };
        } else if (sponsor instanceof File) {
          const res = await saveToTemp(sponsor, `sponsor_${idx}`);
          if (res) {
            tempFiles[`sponsor_${idx}`] = res.filepath;
            return { name: sponsor.name || `Sponsor ${idx + 1}`, image_url: res.filepath };
          }
        }
        return { name: "", image_url: "" };
      };

      sponsorData.push(await processSponsor(sponsors.sponsor1, 0));
      sponsorData.push(await processSponsor(sponsors.sponsor2, 1));
      sponsorData.push(await processSponsor(sponsors.sponsor3, 2));

        sponsor1: (sponsors.sponsor1 instanceof File) ? sponsors.sponsor1.name : sponsors.sponsor1,
        sponsor2: (sponsors.sponsor2 instanceof File) ? sponsors.sponsor2.name : sponsors.sponsor2,
        sponsor3: (sponsors.sponsor3 instanceof File) ? sponsors.sponsor3.name : sponsors.sponsor3
      });

      const apiBody = {
        presenting: flyerFormStore.flyerFormDetail.eventDetails.presenting,
        event_title: flyerFormStore.flyerFormDetail.eventDetails.mainTitle,
        event_date: flyerFormStore.flyerFormDetail.eventDetails.date
          ? new Date(flyerFormStore.flyerFormDetail.eventDetails.date).toISOString().split("T")[0]
          : "",
        flyer_info: flyerFormStore.flyerFormDetail.eventDetails.flyerInfo,
        address_phone: flyerFormStore.flyerFormDetail.eventDetails.addressAndPhone,

        djs: djsWithUrls,
        host: hostsWithUrls,
        sponsors: sponsorData,
        venue_logo_url: venueLogoUrl,
        venue_text: flyerFormStore.flyerFormDetail.eventDetails.venueText,

        story_size_version: flyerFormStore.flyerFormDetail.extras.storySizeVersion,
        custom_flyer: flyerFormStore.flyerFormDetail.extras.customFlyer,
        animated_flyer: flyerFormStore.flyerFormDetail.extras.animatedFlyer,
        instagram_post_size: flyerFormStore.flyerFormDetail.extras.instagramPostSize,

        custom_notes: flyerFormStore.flyerFormDetail.customNote,
        flyer_id: flyer?.id ?? flyerFormStore.flyerFormDetail.flyerId ?? "",
        category_id: (flyer as any)?.category_id ?? flyer?.category ?? flyerFormStore.flyerFormDetail.categoryId,
        user_id: authStore.user.id,

        delivery_time: flyerFormStore.flyerFormDetail.deliveryTime,
        total_price: totalDisplay,
        subtotal: totalDisplay,
        image_url: flyerImage,

        // IMPORTANT: Pass the temp file mapping so success handler can pick them up
        temp_files: tempFiles
      };

        ...apiBody,
        host: apiBody.host,
        sponsors: apiBody.sponsors,
        djs: apiBody.djs
      });

        event_title: apiBody.event_title,
        presenting: apiBody.presenting,
        total_price: apiBody.total_price,
        user_id: authStore.user.id,
        image_url: apiBody.image_url,
        flyer_id: apiBody.flyer_id,
        temp_files_count: Object.keys(tempFiles).length
      });

      // Save recent data for autofill
      if (apiBody.address_phone) {
        saveRecentItem('address', apiBody.address_phone);
      }
      if (apiBody.presenting) {
        saveRecentItem('presenting', apiBody.presenting);
      }
      djsWithUrls.forEach(dj => {
        if (dj.name) saveRecentItem('dj', dj.name);
      });
      hostsWithUrls.forEach(h => {
        if (h.name) saveRecentItem('host', h.name);
      });

      // Create Stripe checkout session with order data
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalDisplay,
          orderData: {
            userId: authStore.user.id,
            userEmail: authStore.user.email || authStore.user.name || 'unknown@example.com',
            formData: apiBody
          }
        })
      });


      if (!res.ok) {
        const text = await res.text().catch(() => null);
        console.error("❌ Checkout session error response:", text);
        toast.error("Unable to create checkout session. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();

      if (!data?.sessionId) {
        console.error("❌ Stripe response missing sessionId", data);
        toast.error("Checkout session not generated. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Get the Stripe Checkout URL from the session
      const stripeSession = await fetch(`/api/checkout/get-session-url?sessionId=${data.sessionId}`);

      if (!stripeSession.ok) {
        console.error('❌ Failed to get session URL');
        toast.error("Failed to get payment URL. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const { url } = await stripeSession.json();

      if (!url) {
        console.error('❌ No checkout URL returned');
        toast.error("Failed to get payment URL. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Redirect to Stripe Checkout URL
      window.location.href = url;

    } catch (err) {
      console.error("❌ Checkout error:", err);
      console.error("Error details:", {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        error: err
      });
      toast.error("An error occurred during checkout. Please try again.");
      setIsSubmitting(false);
    }
  };

  // Test order function
  const handleTestOrder = async () => {

    if (!authStore.user?.id) {
      toast.error("Please sign in to create a test order.");
      authStore.handleAuthModal();
      return;
    }


    const { valid, errors } = flyerFormStore.validateForm();

    if (!valid) {
      toast.error(errors.join("\n"));
      return;
    }

    setIsSubmitting(true);
    flyerFormStore.setUserId(authStore.user.id);

    try {

      // Create FormData to handle file uploads
      const formData = new FormData();

      // Get the form data
      const apiBody = mapToApiRequest(flyerFormStore.flyerFormDetail, {
        userId: authStore.user.id,
        flyerId: flyer?.id ?? flyerFormStore.flyerFormDetail.flyerId,
        categoryId:
          (flyer as any)?.category_id ??
          flyer?.category ??
          flyerFormStore.flyerFormDetail.categoryId,
        subtotal: totalDisplay,
        image_url: image || ""
      });


      // Add individual form fields (matching Postman format)
      formData.append('presenting', apiBody.presenting);
      formData.append('event_title', apiBody.event_title);
      formData.append('event_date', apiBody.event_date);
      formData.append('flyer_info', apiBody.flyer_info);
      formData.append('address_phone', apiBody.address_phone);

      // Add DJs as JSON string
      formData.append('djs', JSON.stringify(apiBody.djs));

      // Add host as JSON string
      formData.append('host', JSON.stringify(apiBody.host));

      // Add sponsors as JSON string
      formData.append('sponsors', JSON.stringify(apiBody.sponsors));

      // Add boolean fields
      formData.append('story_size_version', apiBody.story_size_version.toString());
      formData.append('custom_flyer', apiBody.custom_flyer.toString());
      formData.append('animated_flyer', apiBody.animated_flyer.toString());
      formData.append('instagram_post_size', apiBody.instagram_post_size.toString());

      // Add other fields
      formData.append('delivery_time', apiBody.delivery_time);
      formData.append('custom_notes', apiBody.custom_notes);
      formData.append('flyer_is', apiBody.flyer_id);

      // Add user information
      formData.append('web_user_id', authStore.user.id);
      formData.append('email', authStore.user.email || authStore.user.name || 'unknown@example.com');

      // Add files if they exist
      // Add files if they exist
      // Note: 'image' variable is a string/URL from searchParams, not a File object.
      // If there's a file upload for the main flyer, it should be in the store.
      // Removing dead code block.

      // Add venue logo if it exists
      if (typeof flyerFormStore.flyerFormDetail.eventDetails.venueLogo === 'string') {
        formData.append('venue_logo', flyerFormStore.flyerFormDetail.eventDetails.venueLogo);
      } else if (flyerFormStore.flyerFormDetail.eventDetails.venueLogo instanceof File) {
        formData.append('venue_logo', flyerFormStore.flyerFormDetail.eventDetails.venueLogo);
      }

      // Add DJ/Artist images
      flyerFormStore.flyerFormDetail.djsOrArtists.forEach((dj, index) => {
        if (dj.image instanceof File) {
          formData.append(`dj_${index}`, dj.image);
        }
      });

      // Add host images
      if (Array.isArray(flyerFormStore.flyerFormDetail.host)) {
        flyerFormStore.flyerFormDetail.host.forEach((h, index) => {
          if (h.image instanceof File) {
            if (index === 0) {
              formData.append('host', h.image);
            } else {
              formData.append(`host_${index}`, h.image);
            }
          }
        });
      }

      // Add sponsor images
      Object.entries(flyerFormStore.flyerFormDetail.sponsors).forEach(([key, sponsor]) => {
        if (sponsor instanceof File) {
          formData.append(`sponsor_${key}`, sponsor);
        }
      });

        dataKeys: Array.from(formData.keys()),
        hasFiles: formData.has('image') || formData.has('venue_logo'),
        userId: authStore.user.id
      });

      // Save recent data for autofill
      if (apiBody.address_phone) {
        saveRecentItem('address', apiBody.address_phone);
      }
      if (apiBody.presenting) {
        saveRecentItem('presenting', apiBody.presenting);
      }
      apiBody.djs.forEach((dj: any) => {
        if (dj.name) saveRecentItem('dj', dj.name);
      });
      apiBody.host.forEach((h: any) => {
        if (h.name) saveRecentItem('host', h.name);
      });


      // Send test order to dedicated test-order API
      const response = await fetch("/api/test-order", {
        method: "POST",
        body: formData,
      });


      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        console.error("❌ Test order error:", errorData);
        toast.error(`Test order failed: ${errorData.message || "Please try again."}`);
        return;
      }

      const result = await response.json();

      toast.success("🎉 Test order created successfully!");

      // Show order details
      if (result.orderId) {
        toast.success(`📋 Order ID: ${result.orderId}`);
      }
      if (result.data?.id) {
        toast.success(`📋 Order ID: ${result.data.id}`);
      }

    } catch (error: any) {
      console.error("❌ Test order error:", error);
      toast.error(`Test order failed: ${error.message || "Please try again."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // add to cart function 
  const addtoCart = async (id?: string) => {
    const resolvedFlyerId =
      id ??
      flyer?.id ??
      flyerFormStore.flyerFormDetail.flyerId;

    if (!resolvedFlyerId) {
      toast.error("Please select a flyer first.");
      return;
    }

    // alert("User ID: " + authStore.user?.id);
    if (!authStore.user?.id) {
      toast.error("Please sign in to add items to your cart.");
      authStore.handleAuthModal();
      return;
    }

    const { valid, errors } = flyerFormStore.validateForm();
    if (!valid) {
      toast.error(errors.join("\n"));
      return;
    }

    flyerFormStore.setUserId(authStore.user.id);

    // Create FormData for cart API - handle venueLogo null case
    const formDetailForCart: any = {
      ...flyerFormStore.flyerFormDetail,
      eventDetails: {
        ...flyerFormStore.flyerFormDetail.eventDetails,
        venueLogo: flyerFormStore.flyerFormDetail.eventDetails.venueLogo || undefined
      }
    };

    const cartFormData = createCartFormData(formDetailForCart, {
      flyerId: resolvedFlyerId,
      categoryId:
        (flyer as any)?.category_id ??
        flyer?.category ??
        flyerFormStore.flyerFormDetail.categoryId,
      totalPrice: String(totalDisplay),
      subtotal: String(totalDisplay),
      deliveryTime: "1 Hour",
      imageUrl: image || ""
    });

    // Set the actual user ID
    const finalFormData = setUserIdInFormData(cartFormData, authStore.user.id);

    try {
      await cartStore.addToCart(finalFormData);
      toast.success("Added to cart. You can keep shopping.");
    } catch (error: any) {
      console.error("Cart save error", error);
      toast.error(error.message || "Unable to add to cart. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-3 md:p-5 max-w-[1600px] mx-auto w-full">
        {/* Left Side - Event Flyer */}
        <div className="space-y-6 w-full max-w-[280px] mx-auto lg:max-w-full">
                   <div className="relative bg-gradient-to-br from-orange-900/20 via-black to-purple-900/20 rounded-2xl overflow-hidden  glow-effect transition-all duration-300 ">


            <div className="relative p-3 md:p-6 space-y-4">
              <div className="float-effect flex justify-between items-center gap-2">
                <h1
                  className="text-sm md:text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {flyerName}
                </h1>

                {/* Price Section */}
                <div className="flex shrink-0">

                  <span className="text-xs md:text-sm font-bold text-white border border-primary px-2 py-1 rounded-md shadow-md bg-black/50 backdrop-blur-sm">
                    {formatCurrency(basePrice)}
                  </span>

                </div>
              </div>

              <div className="aspect-[4/5] relative rounded-xl flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary hover:scale-[1.02]">
                <img
                  src={flyerImage}
                  alt={flyerName || "Event promotional image"}
                  className="w-full h-full object-cover"
                />
                {/* Dynamic Ribbon */}
                <FlyerRibbon flyer={flyer} />
              </div>


            </div>
          </div>
        </div>


        {/* Right Side - Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Event Details Section */}
          <EventDetails />

          {/* Split Layout: DJ/Artist (Left) + Host (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DJ or Artist Section - LEFT SIDE */}
            <div
              className="space-y-4 bg-gradient-to-br from-red-950/20 to-black p-4 
          rounded-2xl border border-gray-800"
            >
              <h2 className="text-xl font-bold">DJ or Artist</h2>

              {(flyer?.form_type === "With Photo" || flyer?.hasPhotos) ? djList.map((dj, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-semibold flex items-center gap-2">
                        <Music className="w-4 h-4 text-primary" />
                        DJ/Artist {index + 1}
                      </Label>
                      <RecentSuggestions 
                        type="dj" 
                        onSelect={(val) => {
                          flyerFormStore.updateDJ(index, "name", val);
                          setDjList((prev) => {
                            const newList = [...prev];
                            newList[index] = { ...newList[index], name: val };
                            return newList;
                          });
                        }}
                      />
                    </div>

                    {djList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="text-primary cursor-pointer text-xs hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {/* Input field with upload button on RIGHT side */}
                  <div className="relative">
                    <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg shadow-md hover:border-primary hover:shadow-[0_0_15px_rgba(185,32,37,0.8)] transition-all duration-300 pr-3">
                      {/* Name input - takes full width */}
                      <Input
                        value={dj.name}
                        onChange={(e) => handleNameChange(e, index)}
                        placeholder="Enter DJ name..."
                        className="bg-transparent border-none text-white placeholder:text-gray-600 
                          focus-visible:ring-0 focus-visible:ring-offset-0 h-10 flex-1 pl-3 pointer-events-auto"
                      />

                      {/* Image preview on RIGHT (if uploaded) */}
                      {dj.image && (
                        <>
                          <div className="flex-shrink-0">
                            <img
                              src={dj.image}
                              alt="DJ"
                              className="w-8 h-8 rounded object-cover border border-primary"
                            />
                          </div>

                          {/* Remove image button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="text-primary text-xs hover:underline font-semibold flex-shrink-0"
                          >
                            Remove
                          </button>
                        </>
                      )}

                      {/* Upload button on RIGHT (only show if NO image) */}
                      {!dj.image && (
                        <div className="flex items-center gap-1">
                          {authStore.user?.id && (
                            <MediaLibraryDialog
                              userId={authStore.user.id}
                              onSelect={(items) => handleLibrarySelect(items, index)}
                              trigger={
                                <button
                                  type="button"
                                  className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 hover:bg-primary/20 transition-all text-primary"
                                  title="Choose from library"
                                >
                                  <ImageIcon className="w-4 h-4" />
                                </button>
                              }
                            />
                          )}
                          <label htmlFor={`dj-upload-${index}`} className="cursor-pointer flex-shrink-0 pointer-events-auto">
                            <div className="flex items-center justify-center w-8 h-8 rounded bg-primary/10 hover:bg-primary/20 transition-all">
                              <Upload className="w-4 h-4 text-primary" />
                            </div>
                            <input
                              id={`dj-upload-${index}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, index)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
                :
                djListText.map((dj, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                          <Music className="w-4 h-4 text-primary" />
                          DJ/Artist {index + 1}
                        </Label>
                        <RecentSuggestions 
                          type="dj" 
                          onSelect={(val) => {
                            flyerFormStore.updateDJ(index, "name", val);
                            setDjListText((prev) => {
                              const newList2 = [...prev];
                              newList2[index] = { ...newList2[index], name: val };
                              return newList2;
                            });
                          }}
                        />
                      </div>

                      {/* Remove Field Button */}
                      {djListText.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField(index)}
                          className="text-primary cursor-pointer text-xs hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <Input
                      value={dj.name}
                      onChange={(e) => handleNameChange(e, index)}
                      placeholder="Enter DJ name..."
                      className="bg-gray-950 border border-gray-800 text-white placeholder:text-gray-600 
                        rounded-lg h-10 shadow-md
                        focus-visible:!ring-0 focus-visible:!outline-none
                        focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
                        transition-all duration-300"
                    />
                  </div>
                ))
              }

              <button
                type="button"
                onClick={handleAddField}
                disabled={(flyer?.form_type === "With Photo" || flyer?.hasPhotos) ? djList.length >= 4 : djListText.length >= 4}
                className="mt-2 w-full h-10 rounded-lg flex items-center justify-center transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-md bg-[#b92025] hover:bg-red-600"
                style={{
                  backgroundColor: '#b92025',
                  color: 'white'
                }}
              >
                <span className="text-white font-semibold text-sm">
                  Add More ({(flyer?.form_type === "With Photo" || flyer?.hasPhotos) ? djList.length : djListText.length}/4)
                </span>
              </button>
            </div>

            {/* Host Section - RIGHT SIDE */}
            <HostSection />
          </div>

          {/* sponser Section */}
          <SponsorsBlock />

          {/* Split Layout: Delivery Time (Left) + Extras (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DeliveryTimeBlock />
            <ExtrasBlock />
          </div>

          {/* Note for the Designer */}
          <div className="space-y-2">
            <Textarea
              value={note}
              rows={3}
              onChange={(e) => (setNote(e.target.value), flyerFormStore.updateCustomNote(e.target.value))}
              placeholder="Note for the Designer"
              className="bg-gray-950 border border-gray-800 text-white
             placeholder:text-gray-600 rounded-lg 
             shadow-md
             focus-visible:!ring-0 focus-visible:!outline-none
             focus-visible:!shadow-[0_0_15px_rgba(185,32,37,0.8)]
             transition-all duration-300"
            />
          </div>



          {/* Submit Section */}
          <div
            className="bg-gradient-to-br from-red-950/30 to-black p-4 rounded-2xl border border-gray-800 
          flex items-center justify-between"
          >
            <div className="flex gap-4 justify-center items-center">

              {/* Submit Button */}
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-primary hover:bg-red-550 text-white px-3 
               rounded-lg hover:cursor-pointer transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Checkout Now
                  </span>
                )}
              </Button>

              {/* Add to Cart Button */}
              <Button
                type="button"
                variant={'outline'}
                className="hover:cursor-pointer"
                onClick={() => addtoCart(flyer?.id)}
              >
                Add To Cart
              </Button>

            </div>
            {/* Right: Total Amount */}
            <div className="text-right">
              <span className="block text-sm text-gray-300 font-semibold">
                Total
              </span>
              <span className="text-primary font-bold text-lg">
                {formatCurrency(totalDisplay)}
              </span>
            </div>
          </div>

          {/* Similar Flyers */}
          <div className="space-y-4 bg-gradient-to-br from-red-950/20 to-black p-4 rounded-2xl border border-gray-800">
            <h3 className="text-xl font-bold text-white">Similar Flyers</h3>
            <div className="">
              <FlyersCarousel
                flyers={flyerFormStore.similarFlyers}
                selectedIds={selectedFlyerIds}
                onSelect={(selectedFlyer) => {
                  const idStr = String(selectedFlyer.id);

                  // 1. Toggle Selection State
                  setSelectedFlyerIds(prev => {
                    const isSelected = prev.includes(idStr);
                    if (isSelected) {
                      // Don't allow deselecting the active one (optional UX choice, but safest)
                      // if (idStr === String(flyer?.id)) return prev; 
                      return prev.filter(id => id !== idStr);
                    } else {
                      return [...prev, idStr];
                    }
                  });

                  // 2. Set as Active Preview (Always switch preview to what was clicked)
                  // Use 'false' to prevent refreshing list
                  flyerFormStore.setFlyerId(selectedFlyer.id);
                  flyerFormStore.fetchFlyer(selectedFlyer.id, false);
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default observer(EventBookingForm);
