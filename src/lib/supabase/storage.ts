import { createClient } from './client';

export async function uploadLogo(file: File, sindicatoId: string): Promise<{ url?: string; error?: string }> {
  try {
    const supabase = createClient();
    
    // Extensão do arquivo (ex: .png, .jpg)
    const fileExt = file.name.split('.').pop();
    // Gera um nome único para evitar colisões
    const fileName = `${sindicatoId}-${Date.now()}.${fileExt}`;
    
    // Faz o upload para o bucket 'logos'
    const { data, error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // não sobrescreve, cria um novo (garantindo que o browser não cacheie imagem velha)
      });

    if (error) {
      console.error("Erro no upload do storage:", error);
      return { error: "Falha ao enviar a imagem. Verifique se o bucket 'logos' foi criado." };
    }

    // Pega a URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('logos')
      .getPublicUrl(data.path);

    return { url: publicUrl };
  } catch (error: any) {
    console.error("Exceção no uploadLogo:", error);
    return { error: "Ocorreu um erro inesperado ao fazer o upload." };
  }
}
