import CommonTypes "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type GalleryImage = {
    id : CommonTypes.ImageId;
    title : Text;
    description : Text;
    fileBlob : Storage.ExternalBlob;
    category : CommonTypes.GalleryCategory;
    uploadedAt : CommonTypes.Timestamp;
  };
};
