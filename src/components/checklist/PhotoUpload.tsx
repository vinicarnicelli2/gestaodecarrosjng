import { useRef } from "react";
import { Camera, X, Loader2 } from "lucide-react";

interface PhotoUploadProps {
  photos: { file: File; preview: string }[];
  uploading: boolean;
  onAdd: (files: FileList) => void;
  onRemove: (index: number) => void;
}

const PhotoUpload = ({ photos, uploading, onAdd, onRemove }: PhotoUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-card rounded-lg border p-6 animate-fade-in">
      <h2 className="font-display font-semibold text-lg mb-3 flex items-center gap-2">
        <Camera size={20} className="text-accent" />
        Fotos de Avarias
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Registre fotos de problemas encontrados (máx. 5 fotos)
      </p>

      <div className="flex flex-wrap gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="relative group w-24 h-24 rounded-lg overflow-hidden border">
            <img
              src={photo.preview}
              alt={`Avaria ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {photos.length < 5 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <Camera size={20} />
                <span className="text-[10px] font-medium">Adicionar</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) {
            onAdd(e.target.files);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};

export default PhotoUpload;
