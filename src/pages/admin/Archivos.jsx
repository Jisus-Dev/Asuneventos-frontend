import { useState } from 'react'
import { Upload, File, ImageIcon, Loader2, X, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '../../api/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const UPLOADS_KEY = 'asuneventos_uploads'

function getStoredUploads() {
  try {
    return JSON.parse(localStorage.getItem(UPLOADS_KEY) || '[]')
  } catch {
    return []
  }
}

function storeUpload(upload) {
  const stored = getStoredUploads()
  stored.unshift(upload)
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(stored.slice(0, 50)))
}

function removeStoredUpload(filename) {
  const stored = getStoredUploads().filter((u) => u.filename !== filename)
  localStorage.setItem(UPLOADS_KEY, JSON.stringify(stored))
}

function clearStoredUploads() {
  localStorage.removeItem(UPLOADS_KEY)
}

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i

export default function Archivos() {
  const [uploads, setUploads] = useState(getStoredUploads)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo excede el límite de 10 MB')
      e.target.value = ''
      return
    }

    const isImage = IMAGE_EXTENSIONS.test(file.name)
    if (isImage) {
      setPreview({ url: URL.createObjectURL(file), name: file.name, size: file.size, type: file.type })
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await api.post('/archivos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const newUpload = {
        filename: data.filename,
        originalName: file.name,
        size: file.size,
        type: file.type,
        isImage,
        uploadedAt: new Date().toISOString(),
      }

      storeUpload(newUpload)
      setUploads((prev) => [newUpload, ...prev])
      toast.success('Archivo subido correctamente')
      e.target.value = ''

      if (isImage) {
        setTimeout(() => setPreview(null), 500)
      }
    } catch {
      toast.error('Error al subir el archivo')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = (filename) => {
    removeStoredUpload(filename)
    setUploads((prev) => prev.filter((u) => u.filename !== filename))
    toast.success('Archivo eliminado del registro')
  }

  const handleClearAll = () => {
    clearStoredUploads()
    setUploads([])
    toast.success('Galería limpiada')
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const uploadsDir = 'uploads/'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Archivos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Galería multimedia del sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          {uploads.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="size-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {/* Upload zone */}
      <Card className="border-dashed border-2 hover:border-zinc-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-12">
          {preview ? (
            <div className="space-y-4 text-center">
              <div className="relative inline-block">
                <img src={preview.url} alt={preview.name} className="max-h-48 max-w-md rounded-lg object-contain bg-zinc-100" />
                <button onClick={() => setPreview(null)} className="absolute -top-2 -right-2 size-6 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700">
                  <X className="size-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-700">{preview.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(preview.size)}</p>
              </div>
              <Button onClick={handleUpload} disabled className="w-full">
                {uploading ? <><Loader2 className="size-4 animate-spin" />Subiendo...</> : 'Subir archivo'}
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center gap-3 cursor-pointer w-full">
              <div className="size-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Upload className="size-8 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700">Arrastra o selecciona un archivo</p>
                <p className="text-xs text-muted-foreground mt-1">Imágenes, PDFs, documentos — máx. 10 MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip"
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Gallery grid */}
      {uploads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ImageIcon className="size-12 text-zinc-300 mb-3" />
            <p className="text-sm font-medium text-zinc-600">No hay archivos subidos</p>
            <p className="text-xs text-muted-foreground mt-1">Sube archivos para verlos aquí</p>
          </CardContent>
        </Card>
      ) : (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {uploads.length} archivo{uploads.length !== 1 ? 's' : ''} subido{uploads.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {uploads.map((file) => (
              <Card key={file.filename} className="group overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-square bg-zinc-100 flex items-center justify-center relative">
                  {file.isImage ? (
                    <img
                      src={`/${uploadsDir}${file.filename}`}
                      alt={file.originalName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div
                    className={`${file.isImage ? 'hidden' : 'flex'} flex-col items-center justify-center gap-2 p-4`}
                    style={file.isImage ? { display: 'none' } : {}}
                  >
                    <File className="size-10 text-zinc-400" />
                    <span className="text-xs text-zinc-500 uppercase">
                      {file.type?.split('/')[1] || file.originalName.split('.').pop() || '?'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-red-50"
                    onClick={() => handleDelete(file.filename)}
                    title="Eliminar del registro"
                  >
                    <Trash2 className="size-3 text-zinc-500 hover:text-red-500" />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-zinc-700 truncate" title={file.originalName}>
                    {file.originalName}
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                    {file.isImage && <Badge variant="secondary" className="text-[10px] h-4 px-1">IMG</Badge>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
