"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { observer } from "mobx-react-lite";
import { FlyersCarousel } from "./FlyersCarousel";
import { FlyersSkeleton } from "./FlyersSkeleton";
import { useStore } from "@/stores/StoreProvider";

type FlyersSectionProps = {
  type: {
    id: string;
    name: string;
    slug: string;
    homePage: boolean;
  };
};

type Filter = {
  price: string[];
  category: string[];
  type: string[];
};

const FlyersSection: React.FC<FlyersSectionProps> = ({ type }) => {
  const { flyersStore } = useStore();

  // Fetch flyers from backend once
  useEffect(() => {
    if (!flyersStore.flyers.length && !flyersStore.loading) {
      flyersStore.fetchFlyers();
    }
  }, [flyersStore]);

  // Derive flyers from store directly
  let data = flyersStore.flyers;

  if (type.name === "Recently Added") {
    data = flyersStore.recentlyAdded;
  } else if (type.name === "Premium Flyers") {
    data = flyersStore.premiumFlyers;
  } else if (type.name === "Basic Flyers") {
    data = flyersStore.basicFlyers;
  } else {
    data = flyersStore.flyersByCategory(type.name);
  }

  // Helper to shuffle an array (Fisher-Yates) - Move to utility if needed, duplicating here for now to ensure scope
  const shuffleArray = (array: any[]): any[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Apply specific filtering (Birthday form type)
  let Flyers: any[] = data.filter((f: any) => {
    if (f.form_type === "Birthday") {
      return type.name === "Birthday Flyers";
    }
    return true;
  });

  // RANDOMIZE ORDER for everything EXCEPT "Recently Added"
  if (type.name !== "Recently Added") {
    Flyers = shuffleArray(Flyers);
  }

  // Limit to 15 items for performance
  Flyers = Flyers.slice(0, 15);

  if (!Flyers.length) {
    if (flyersStore.loading) {
      return <FlyersSkeleton />;
    }
    return null;
  }

  return (
    <>
      {type.name === "Premium Flyers" ? (
        <section className="my-2 py-2 sm:py-4 px-5 bg-primary/90 shadow-2xl shadow-gray-900">
          <div className="flex flex-col gap-1">
            <div className="text-sm md:text-xl font-bold">
              <Link href={`/categories?slug=${type.slug}`}>{type.name}</Link>
            </div>

            <div className="col-span-8">
              <FlyersCarousel flyers={Flyers} />
            </div>
          </div>
        </section>
      ) : (
        <section className="py-1 px-5">
          <div className="flex flex-col gap-1">
            <div className="text-sm md:text-lg font-semibold text-foreground">
              <Link href={`/categories?slug=${type.slug}`}>{type.name}</Link>
            </div>

            <div className="col-span-8">
              <FlyersCarousel flyers={Flyers} />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default observer(FlyersSection);
