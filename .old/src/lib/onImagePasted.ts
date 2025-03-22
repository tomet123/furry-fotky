import { SetStateAction } from 'react';
import { authorizedFetch } from './api';

/**
 * Pomocná funkce pro vložení textu do textového pole
 */
const insertToTextArea = (insertString: string): string | null => {
  const textarea = document.querySelector('textarea');
  if (!textarea) {
    return null;
  }
  
  let sentence = textarea.value;
  const len = sentence.length;
  const pos = textarea.selectionStart;
  const end = textarea.selectionEnd;
  
  const front = sentence.slice(0, pos);
  const back = sentence.slice(pos, len);
  
  sentence = front + insertString + back;
  textarea.value = sentence;
  textarea.selectionEnd = end + insertString.length;
  
  return sentence;
};

/**
 * Nahraje obrázky přetažené nebo vložené do editoru
 */
const onImagePasted = async (
  dataTransfer: DataTransfer,
  setMarkdown: (value: string | undefined) => void
): Promise<void> => {
  const files: File[] = [];
  
  // Získat soubory z dataTransfer objektu
  for (let index = 0; index < dataTransfer.items.length; index++) {
    const file = dataTransfer.files.item(index);
    if (file && file.type.startsWith('image/')) {
      files.push(file);
    }
  }
  
  // Pokud nejsou žádné obrázky, končíme
  if (files.length === 0) {
    return;
  }
  
  await Promise.all(
    files.map(async (file) => {
      try {
        // Vytvoření FormData pro nahrání souboru
        const formData = new FormData();
        formData.append('image', file);
        
        // Nahrání obrázku na server - použití authorizedFetch
        const response = await authorizedFetch('/api/upload/profileImage', {
          method: 'POST',
          body: formData,
          // Pro FormData nenastavujeme 'Content-Type'
          headers: {}
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Pokud bylo nahrání úspěšné, vložíme markdown s URL obrázku
          const imageMarkdown = `![${file.name}](${result.imageUrl})`;
          const newMarkdown = insertToTextArea(imageMarkdown);
          
          if (newMarkdown) {
            setMarkdown(newMarkdown);
          }
        } else {
          console.error('Chyba při nahrávání obrázku:', result.message);
          alert(`Chyba při nahrávání obrázku: ${result.message}`);
        }
      } catch (error) {
        console.error('Chyba při zpracování obrázku:', error);
        alert('Při nahrávání obrázku došlo k chybě. Zkuste to prosím znovu.');
      }
    })
  );
};

export default onImagePasted; 