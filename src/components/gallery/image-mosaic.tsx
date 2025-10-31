import type { GalleryImage } from "@/generated/prisma";

type ImageMosaicProps = {
  images: GalleryImage[];
};

export function ImageMosaic({ images }: ImageMosaicProps) {
  if (!images.length) {
    return null;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {images.slice(0, 3).map((image, index) => (
        <div
          key={image.id}
          className={`group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:shadow-lg hover:shadow-slate-500/15 ${
            index === 0 ? "lg:col-span-2" : ""
          }`}
          style={{ minHeight: index === 0 ? "320px" : "240px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.imageUrl}
            alt={image.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105 group-hover:opacity-90"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-6 text-white">
            <h3 className="text-lg font-semibold">{image.title}</h3>
            {image.description && (
              <p className="text-sm text-white/80">{image.description}</p>
            )}
            {image.link && (
              <a
                href={image.link}
                className="self-start text-xs font-semibold text-sky-200 hover:text-white"
              >
                مشاهده بیشتر →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
