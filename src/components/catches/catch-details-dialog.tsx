// Previous catch-details-dialog.tsx content remains the same, but we'll update the image handling:

const getImageUrl = (photoId: string) => {
  return storage.getFilePreview(
    BUCKETS.CATCH_PHOTOS,
    photoId,
    800, // width
    800, // height
    'center', // gravity
    100, // quality
    0, // border
    'jpg' // output format
  ).href;
};
// Define the CatchDetailsDialog component
export function CatchDetailsDialog({ photoId, onClose }: { photoId: string; onClose: () => void }) {
  const imageUrl = getImageUrl(photoId);

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <button onClick={onClose} className="close-button">Close</button>
        <img src={imageUrl} alt="Catch photo" className="catch-image" />
        {/* Additional dialog content can go here */}
      </div>
    </div>
  );
}