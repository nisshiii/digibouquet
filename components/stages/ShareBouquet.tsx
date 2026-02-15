import Image from "next/image";
import { flowers } from "../../data/data";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import Bouquet from "../bouquet/Bouquet";
import { useBouquet } from "../../context/BouquetContext";
import type { Bouquet as BouquetType } from "@/types/bouquet";

export default function ShareBouquet() {
  const { bouquet } = useBouquet();
  // Helper function to get flower dimensions based on size
  const getFlowerDimensions = (size: string) => {
    switch (size) {
      case "small":
        return 80;
      case "large":
        return 160;
      default:
        return 120; // medium
    }
  };

  const router = useRouter();

  const handleCreateBouquet = async (bouquet: BouquetType) => {
    if (!supabase) {
      console.error("Supabase is not configured.");
      return;
    }

    const short_id = nanoid(8);

    const { data, error } = await supabase
      .from("bouquets")
      .insert([
        {
          short_id: short_id,
          mode: bouquet.mode,
          flowers: bouquet.flowers,
          letter: {
            ...bouquet.letter,
            font: bouquet.font,
          },
          timestamp: bouquet.timestamp,
          greenery: bouquet.greenery,
          flowerOrder: bouquet.flowerOrder,
        },
      ])
      .select(); // returns inserted row(s)

    if (error || !data || data.length === 0) {
      console.error("Error creating bouquet:", error);
      return;
    }

    const bouquetId = data[0].id;
    router.push(`/bouquet/${bouquetId}`);
  };

  return (
    <div className="text-center">
      <h2 className="text-md uppercase text-center mb-10">SEND THE BOUQUET</h2>

      <Bouquet bouquet={bouquet} />
      <button
        onClick={() => {
          console.log("Sending bouquet");
          handleCreateBouquet(bouquet);
        }}
        className="uppercase text-white bg-black px-5 py-3"
      >
        CREATE SHAREABLE LINK
      </button>
    </div>
  );
}
