import List "mo:core/List";
import Storage "mo:caffeineai-object-storage/Storage";
import CommonTypes "../types/common";
import GalleryTypes "../types/gallery";

module {
  public type GalleryImage = GalleryTypes.GalleryImage;

  public func addImage(
    images : List.List<GalleryImage>,
    nextId : Nat,
    title : Text,
    description : Text,
    fileBlob : Storage.ExternalBlob,
    category : CommonTypes.GalleryCategory,
    uploadedAt : CommonTypes.Timestamp,
  ) : GalleryImage {
    let image : GalleryImage = {
      id = nextId;
      title;
      description;
      fileBlob;
      category;
      uploadedAt;
    };
    images.add(image);
    image;
  };

  public func getImage(images : List.List<GalleryImage>, id : CommonTypes.ImageId) : ?GalleryImage {
    images.find(func(i) { i.id == id });
  };

  public func listImages(images : List.List<GalleryImage>) : [GalleryImage] {
    images.toArray();
  };

  public func listImagesByCategory(images : List.List<GalleryImage>, category : CommonTypes.GalleryCategory) : [GalleryImage] {
    images.filter(func(i) { i.category == category }).toArray();
  };

  public func deleteImage(images : List.List<GalleryImage>, id : CommonTypes.ImageId) : Bool {
    let sizeBefore = images.size();
    let filtered = images.filter(func(i) { i.id != id });
    images.clear();
    images.append(filtered);
    images.size() < sizeBefore;
  };
};
