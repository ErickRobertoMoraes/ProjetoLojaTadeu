"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CatalogImage } from "@/lib/catalog/catalog";

type ImageWithUrl = CatalogImage & { url: string };

export function ImageManager({ productId, images }: { productId: string; images: ImageWithUrl[] }) {
  const router = useRouter();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const file = new FormData(formElement).get("file");
    if (!(file instanceof File) || !file.size) {
      setNotice("Escolha uma imagem JPEG, PNG ou WebP.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const response = await fetch(`/api/admin/catalog/products/${productId}/images`, { method: "POST", body: new FormData(formElement) });
      const result = await response.json() as { error?: string };
      if (!response.ok) {
        setNotice(result.error === "image_file_invalid"
          ? "Use uma imagem JPEG, PNG ou WebP de até 5 MiB e informe o texto alternativo."
          : "Não foi possível enviar a imagem. Confira o texto alternativo e tente novamente.");
        return;
      }
      formElement.reset();
      setNotice("Imagem enviada.");
      router.refresh();
    } catch { setNotice("Não foi possível conectar ao armazenamento de imagens."); }
    finally { setBusy(false); }
  }

  async function updateAlt(event: React.FormEvent<HTMLFormElement>, image: ImageWithUrl) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/catalog/images/${image.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt_text: form.get("alt_text") }),
      });
      setNotice(response.ok ? "Texto alternativo atualizado." : "Informe um texto alternativo com até 240 caracteres.");
      if (response.ok) router.refresh();
    } catch { setNotice("Não foi possível atualizar o texto alternativo."); }
    finally { setBusy(false); }
  }

  async function remove(image: ImageWithUrl) {
    if (!window.confirm("Excluir esta imagem do catálogo?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/catalog/images/${image.id}`, { method: "DELETE" });
      setNotice(response.ok ? "Imagem excluída." : "Não foi possível excluir a imagem.");
      if (response.ok) router.refresh();
    } catch { setNotice("Não foi possível excluir a imagem."); }
    finally { setBusy(false); }
  }

  return (
    <section className="catalog-submanager" aria-label={`Imagens de ${productId}`}>
      <h4>Imagens</h4>
      {notice && <p role="status" className="form-success">{notice}</p>}
      <form className="catalog-admin-form image-upload-form" onSubmit={(event) => void upload(event)}>
        <label>Arquivo<input name="file" type="file" accept="image/jpeg,image/png,image/webp" required /></label>
        <label>Texto alternativo<input name="alt_text" required maxLength={240} placeholder="Descreva o que aparece na imagem" /></label>
        <button type="submit" disabled={busy}>Enviar imagem</button>
      </form>
      <div className="admin-image-list">
        {images.map((image) => (
          <article className="admin-image-row" key={image.id}>
            <img src={image.url} alt={image.alt_text} />
            <form className="catalog-admin-form" onSubmit={(event) => void updateAlt(event, image)}>
              <label>Texto alternativo<input name="alt_text" defaultValue={image.alt_text} required maxLength={240} /></label>
              <div className="row-actions"><button type="submit" disabled={busy}>Salvar texto</button><button className="text-button" type="button" disabled={busy} onClick={() => void remove(image)}>Excluir imagem</button></div>
            </form>
          </article>
        ))}
        {images.length === 0 && <p className="catalog-notice">Nenhuma imagem cadastrada.</p>}
      </div>
    </section>
  );
}
