import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Storage "mo:caffeineai-object-storage/Storage";
import AccessControl "mo:caffeineai-authorization/access-control";
import CommonTypes "../types/common";
import GalleryTypes "../types/gallery";
import GalleryLib "../lib/gallery";

mixin (
  accessControlState : AccessControl.AccessControlState,
  galleryImages : List.List<GalleryTypes.GalleryImage>,
  nextImageId : CommonTypes.Counter,
) {
  // Admin: upload an image to the gallery
  public shared ({ caller }) func addGalleryImage(
    title : Text,
    description : Text,
    fileBlob : Storage.ExternalBlob,
    category : CommonTypes.GalleryCategory,
  ) : async GalleryTypes.GalleryImage {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add gallery images");
    };
    let image = GalleryLib.addImage(
      galleryImages,
      nextImageId.val,
      title,
      description,
      fileBlob,
      category,
      Time.now(),
    );
    nextImageId.val += 1;
    image;
  };

  // Admin: delete a gallery image
  public shared ({ caller }) func deleteGalleryImage(id : CommonTypes.ImageId) : async Bool {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete gallery images");
    };
    GalleryLib.deleteImage(galleryImages, id);
  };

  // Public: list all gallery images
  public query func listGalleryImages() : async [GalleryTypes.GalleryImage] {
    GalleryLib.listImages(galleryImages);
  };

  // Public: list gallery images by category
  public query func listGalleryImagesByCategory(category : CommonTypes.GalleryCategory) : async [GalleryTypes.GalleryImage] {
    GalleryLib.listImagesByCategory(galleryImages, category);
  };
};
