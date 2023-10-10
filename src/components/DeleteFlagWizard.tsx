import { useUser } from "@clerk/nextjs";
import { type Flag } from "@prisma/client";

export type DeleteFlagModalProps = {
  modalId: string;
  flag: Flag;
};

export const DeleteFlagModal: React.FC<DeleteFlagModalProps> = ({
  modalId,
  flag,
}) => {
  const { isSignedIn } = useUser();

  if (!isSignedIn) return null;

  return (
    <dialog id={modalId} className="modal text-left">
      <div className="modal-box">
        <h2 className="mb-4 text-xl">Delete feature flag</h2>
        <p className="mb-4">
          Are you sure you want to delete the following feature flag?
        </p>
        <p className="mb-4">Name: <span className="font-bold">{flag.name}</span></p>
        <p className="mb-4">Description: <span className="font-bold">{flag.description}</span></p>
        <p className="mb-4">Last updated: <span className="font-bold">{flag.updatedAt.toLocaleDateString("en-GB")}</span></p>
        <button className="btn btn-error">Delete</button>
        <form method="dialog" className="absolute bottom-6 right-6">
          <button className="btn">Cancel</button>
        </form>
      </div>
    </dialog>
  );
};
