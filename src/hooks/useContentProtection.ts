import { useEffect } from 'react'

// Text (article body, comments, everything) is fully copyable and
// selectable - people need that to work with browser/extension
// translation (Google Translate, "copy to translate" tools, the browser's
// built-in page-translate feature) and to quote or share what they read.
// Only media (images, video/embeds) is protected: right-click and
// drag-to-save are blocked specifically on those elements, which is what
// stops the common "save image as" / "save video as" paths.
function isMedia(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return !!target.closest('img, video, iframe, picture, canvas, svg')
}

export function useContentProtection() {
  useEffect(() => {
    function blockMediaContextMenu(e: MouseEvent) {
      if (isMedia(e.target)) e.preventDefault()
    }
    function blockMediaDrag(e: DragEvent) {
      if (isMedia(e.target)) e.preventDefault()
    }
    document.addEventListener('contextmenu', blockMediaContextMenu)
    document.addEventListener('dragstart', blockMediaDrag)
    return () => {
      document.removeEventListener('contextmenu', blockMediaContextMenu)
      document.removeEventListener('dragstart', blockMediaDrag)
    }
  }, [])
}
