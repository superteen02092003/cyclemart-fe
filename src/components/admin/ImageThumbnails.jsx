export function ImageThumbnails({ images, onImageClick }) {
  if (!images || images.length === 0) {
    return (
      <div className="bg-gray-50 border border-border-light rounded-sm p-6 text-center">
        <span className="material-symbols-outlined text-gray-400 text-4xl block mb-2">image_not_supported</span>
        <p className="text-gray-500 font-medium">Không có ảnh</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {images.map((img, i) => (
        <div 
          key={i}
          className="relative aspect-square cursor-pointer group"
          onClick={() => onImageClick && onImageClick(i)}
        >
          <img 
            src={typeof img === 'string' ? img : img.url} 
            alt={`Ảnh ${i+1}`} 
            className="w-full h-full object-cover bg-surface-tertiary rounded-sm border border-border-light group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-sm flex items-center justify-center">
            <span className="material-symbols-outlined text-white opacity-0 group-hover:opacity-100 transition-opacity text-2xl">
              zoom_in
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}