import { useRef, useState, useEffect } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { observer } from "mobx-react-lite";
import { useStore } from "@/stores/StoreProvider";
import { MediaLibraryDialog } from "../upload/media-library-dialog";
import { LibraryItem } from "@/lib/uploads";

const SponsorsBlock = observer(() => {
  const { flyerFormStore } = useStore();

  const sponsorRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Local state for previews and filenames
  const [sponsorImages, setSponsorImages] = useState<(string | null)[]>([null, null, null]);
  const [fileNames, setFileNames] = useState<(string | null)[]>([null, null, null]);

  // -----------------------------
  // ✅ Load initial images from store
  // -----------------------------
  const { authStore } = useStore();
  const userId = authStore.user?.id;

  useEffect(() => {
    const sponsors = flyerFormStore.flyerFormDetail.sponsors;
    
    const getSponsorData = (sponsor: any) => {
      if (sponsor instanceof File) return URL.createObjectURL(sponsor);
      if (typeof sponsor === 'string') return sponsor;
      return null;
    };

    setSponsorImages([
      getSponsorData(sponsors.sponsor1),
      getSponsorData(sponsors.sponsor2),
      getSponsorData(sponsors.sponsor3),
    ]);
    setFileNames([
      (sponsors.sponsor1 instanceof File) ? sponsors.sponsor1.name : (typeof sponsors.sponsor1 === 'string' ? 'Logo' : null), 
      (sponsors.sponsor2 instanceof File) ? sponsors.sponsor2.name : (typeof sponsors.sponsor2 === 'string' ? 'Logo' : null), 
      (sponsors.sponsor3 instanceof File) ? sponsors.sponsor3.name : (typeof sponsors.sponsor3 === 'string' ? 'Logo' : null)
    ]);
  }, [flyerFormStore.flyerFormDetail.sponsors]);

  // -----------------------------
  // ✅ Handle Media Library selection
  // -----------------------------
  const handleLibrarySelect = (items: LibraryItem[], index: number) => {
    if (items.length > 0) {
      const item = items[0];
      const fieldKey = index === 0 ? "sponsor1" : index === 1 ? "sponsor2" : "sponsor3";
      
      flyerFormStore.updateSponsor(fieldKey as any, item.dataUrl);

      const newImages = [...sponsorImages];
      newImages[index] = item.dataUrl;
      setSponsorImages(newImages);

      const newFileNames = [...fileNames];
      newFileNames[index] = "Library Logo";
      setFileNames(newFileNames);
    }
  };

  // -----------------------------
  // ✅ Handle file upload
  // -----------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    // Update MobX store
    if (index === 0) flyerFormStore.updateSponsor("sponsor1", file);
    if (index === 1) flyerFormStore.updateSponsor("sponsor2", file);
    if (index === 2) flyerFormStore.updateSponsor("sponsor3", file);

    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      const newImages = [...sponsorImages];
      newImages[index] = reader.result as string;
      setSponsorImages(newImages);

      const newFileNames = [...fileNames];
      newFileNames[index] = file.name;
      setFileNames(newFileNames);
    };
    reader.readAsDataURL(file);
  };

  // -----------------------------
  // ✅ Remove image
  // -----------------------------
  const removeImage = (index: number) => {
    if (index === 0) flyerFormStore.updateSponsor("sponsor1", null);
    if (index === 1) flyerFormStore.updateSponsor("sponsor2", null);
    if (index === 2) flyerFormStore.updateSponsor("sponsor3", null);

    const newImages = [...sponsorImages];
    newImages[index] = null;
    setSponsorImages(newImages);

    const newFileNames = [...fileNames];
    newFileNames[index] = null;
    setFileNames(newFileNames);
  };

  return (
    <div className="space-y-4 bg-gradient-to-br from-red-950/20 to-black p-4 rounded-2xl border border-gray-800">
      <h2 className="text-xl font-bold">Sponsors</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["Sponsor 1", "Sponsor 2", "Sponsor 3"].map((label, index) => (
          <div key={index} className="flex flex-col gap-2 items-center">
            {/* Hidden file input */}
            <input
              ref={sponsorRefs[index]}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, index)}
            />

            {/* Show upload button only if no image */}
            {!sponsorImages[index] && (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 border-primary text-primary hover:!bg-gray-950 hover:text-primary"
                  onClick={() => sponsorRefs[index].current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  {label} Upload
                </Button>

                {userId && (
                  <MediaLibraryDialog
                    userId={userId}
                    type="logo"
                    onSelect={(items) => handleLibrarySelect(items, index)}
                    trigger={
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2 border-gray-700 text-gray-400 hover:!bg-gray-950 hover:text-white"
                      >
                        <ImageIcon className="h-3 w-3" />
                        Library
                      </Button>
                    }
                  />
                )}
              </div>
            )}

            {/* Show image with small cross button if image exists */}
            {sponsorImages[index] && (
              <div className="relative">
                <img
                  src={sponsorImages[index]!}
                  alt={label}
                  className="w-16 h-16 object-contain border rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-primary"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default SponsorsBlock;
