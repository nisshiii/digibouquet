import Image from "next/image";
import { flowers } from "../../data/data";
import type { BouquetReadOnlyProps } from "@/types/bouquet";
import BouquetMusicPlayer from "./BouquetMusicPlayer";

const fontClassMap: Record<string, string> = {
  martian: "font-martian",
  playfair: "font-playfair",
  crimson: "font-crimson",
  dmserif: "font-dmserif",
};

const getFontClass = (bouquet: BouquetReadOnlyProps["bouquet"]) => {
  const fontKey = bouquet.font ?? bouquet.letter?.font;
  return fontClassMap[fontKey ?? "martian"] ?? fontClassMap.martian;
};

export default function Bouquet({ bouquet, hideFlowers }: BouquetReadOnlyProps) {
  const fontClass = getFontClass(bouquet);
  let absoluteInstanceIndex = 0;

  const flowerInstances = bouquet.flowers.flatMap(
    (flower: { id: number; count: number }, flowerIndex: number) => {
      const flowerData = flowers.find((f) => f.id === flower.id);
      if (!flowerData) return [];

      return Array(flower.count)
        .fill(null)
        .map((_, instanceIndex) => {
          const defaultIndex = absoluteInstanceIndex;
          absoluteInstanceIndex += 1;

          const order =
            bouquet.flowerOrder.length > 0
              ? bouquet.flowerOrder[defaultIndex] ?? defaultIndex
              : defaultIndex;

          return {
            flowerData,
            flowerIndex,
            instanceIndex,
            order,
          };
        });
    }
  );

  const orderedFlowerInstances = [...flowerInstances].sort(
    (a, b) => a.order - b.order
  );

  const getRotation = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 31 + seed.charCodeAt(i)) | 0;
    }
    const normalized = Math.abs(hash % 1000) / 1000;
    return normalized * 10 - 5;
  };

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

  const getJitter = (seed: string, range: number) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 37 + seed.charCodeAt(i)) | 0;
    }
    const normalized = (Math.abs(hash % 1000) / 1000) * 2 - 1;
    return normalized * range;
  };

  const totalFlowers = orderedFlowerInstances.length;
  const columns = totalFlowers >= 9 ? 3 : 2;
  const rows = Math.max(1, Math.ceil(totalFlowers / columns));
  const maxFlowerDimension = orderedFlowerInstances.reduce((maxValue, instance) => {
    return Math.max(maxValue, getFlowerDimensions(instance.flowerData.size));
  }, 120);

  const flowerContainerHeight = Math.max(
    280,
    Math.round(rows * (maxFlowerDimension * 0.5) + maxFlowerDimension * 0.66)
  );
  const topPadding = Math.round(maxFlowerDimension * 0.44);
  const bottomPadding = Math.round(maxFlowerDimension * 0.34);
  const rowStep =
    rows > 1
      ? (flowerContainerHeight - topPadding - bottomPadding) / (rows - 1)
      : 0;

  const columnAnchors =
    columns === 3 ? [30, 50, 70] : [42, 58];

  return (
    <div className="text-center">
      {!hideFlowers && (
        <div className="flex flex-col max-w-lg mx-auto">
          <div className="flex relative justify-center items-center py-4 my-4">
            <div className="relative w-full max-w-[540px] min-h-[380px] sm:min-h-[430px] mx-auto">
              {/* Bush background images - positioned absolutely to stay fixed */}
              {/* Bottom bush layer */}

              <Image
                src={`/${bouquet.mode}/bush/bush-${bouquet.greenery + 1}.png`}
                alt="bush background"
                width={600}
                height={500}
                className="absolute top-1/2 left-1/2 z-0 transform -translate-x-1/2 -translate-y-1/2 max-sm:scale-[1.2]"
                priority
              />

              {/* Flower container - flowers can move around within this area */}

              <div
                className="absolute left-1/2 top-[47%] -translate-x-1/2 -translate-y-1/2 w-[360px] max-w-[94vw] sm:w-[380px]"
                style={{ height: `${flowerContainerHeight}px` }}
              >
                {orderedFlowerInstances.map((instance, visualIndex) => {
                  const { flowerData, flowerIndex, instanceIndex } = instance;
                  const rowIndex = Math.floor(visualIndex / columns);
                  const colIndex = visualIndex % columns;

                  const rotation = getRotation(
                    `${bouquet.mode}-${bouquet.greenery}-${flowerData.id}-${flowerIndex}-${instanceIndex}`
                  );

                  const xJitter = getJitter(
                    `x-${flowerIndex}-${instanceIndex}-${flowerData.id}`,
                    columns === 3 ? 1.2 : 1.8
                  );
                  const yJitter = getJitter(
                    `y-${flowerIndex}-${instanceIndex}-${flowerData.id}`,
                    4
                  );

                  const topPx = topPadding + rowIndex * rowStep + yJitter;
                  const leftPercent = columnAnchors[colIndex] + xJitter;

                  const dimensions = getFlowerDimensions(flowerData.size);

                  return (
                    <div
                      key={`${flowerIndex}-${instanceIndex}`}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPx}px`,
                        zIndex: 8 + rowIndex,
                      }}
                    >
                      <Image
                        src={`/${bouquet.mode}/flowers/${flowerData.name}.png`}
                        alt={flowerData.name}
                        width={dimensions}
                        height={dimensions}
                        className={`relative z-10 transition-transform hover:scale-105 ${
                          flowerData.size === "small"
                            ? "max-sm:w-[82px]"
                            : flowerData.size === "large"
                              ? "max-sm:w-[140px]"
                              : "max-sm:w-[108px]"
                        } max-sm:h-auto`}
                        style={{ transform: `rotate(${rotation}deg)` }}
                        priority
                      />
                    </div>
                  );
                })}
              </div>

              {/* Top bush layer */}

              <div>
                <Image
                  src={`/${bouquet.mode}/bush/bush-${
                    bouquet.greenery + 1
                  }-top.png`}
                  alt="bush top"
                  width={600}
                  height={500}
                  className="absolute top-1/2 left-1/2 z-10 transform -translate-x-1/2 -translate-y-1/2 max-sm:scale-[1.2]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="mx-auto max-w-sm text-sm text-center">
        <div>
          {/* White card container with black border */}
          <div
            className={`border-[1.5px] border-black p-8 mx-auto ${
              hideFlowers
                ? "translate-y-[6px] sm:translate-y-0"
                : "-translate-y-[12px] sm:-translate-y-[18px]"
            } -rotate-2 hover:-rotate-2 transition-all duration-300 ${fontClass}`}
            style={{ backgroundColor: bouquet.letter.cardColor || "#ffffff" }}
          >
            <div className="space-y-4">
              <div className="flex flex-row gap-2 items-start justify-start">
                <p className="bg-transparent border-none focus:outline-none focus:ring-0">
                  Dear {bouquet.letter.recipient}
                </p>
              </div>

              <div className="text-left whitespace-pre-line">
                {bouquet.letter.message}
              </div>

              <div className="flex flex-col gap-2 justify-end items-end">
                <p className="bg-transparent border-none focus:outline-none focus:ring-0">
                  With love,
                </p>
                <p className="bg-transparent border-none focus:outline-none focus:ring-0">
                  {bouquet.letter.sender}
                </p>
              </div>
            </div>
          </div>
          <BouquetMusicPlayer
            songUrl={bouquet.letter.songUrl}
            songPlatform={bouquet.letter.songPlatform}
            songTitle={bouquet.letter.songTitle}
          />
        </div>
      </div>
    </div>
  );
}
