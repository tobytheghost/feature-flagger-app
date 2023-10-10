import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { convertFlagNameToKey } from "../utils/convertFlagNameToKey";

export type CreateNewFlagWizardProps = {
  flagKeys: string[];
};

export const CreateNewFlagWizard: React.FC<CreateNewFlagWizardProps> = ({
  flagKeys,
}) => {
  const { isSignedIn } = useUser();

  const flagFormSchema = z.object({
    name: z
      .string()
      .min(1, "Name not long enough")
      .refine(
        (name) => !flagKeys.includes(convertFlagNameToKey(name)),
        "Name must be unique",
      ),
    description: z.string().min(1, "Please include a description for the flag"),
  });

  const { register, reset, handleSubmit, formState } = useForm<
    z.infer<typeof flagFormSchema>
  >({
    resolver: zodResolver(flagFormSchema),
  });

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.flags.create.useMutation({
    onSuccess: async () => {
      await ctx.flags.getAll.invalidate();
      toast.success("Created new flag");
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong");
      }
    },
    onSettled: () => reset({ name: "", description: "" }),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => {
      mutate(data);
    })(event);
  };

  if (!isSignedIn) return null;

  return (
    <form className="prose flex w-full flex-col gap-3" onSubmit={onSubmit}>
      <h2 className="text-xl">Create new feature flag</h2>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Name</span>
        </label>
        <input
          className={`input input-md input-bordered grow ${
            !!formState.errors.name ? "input-error" : ""
          }`}
          type="text"
          disabled={isPosting}
          {...register("name")}
        />
        {formState.errors.name?.message && (
          <span className="text-red-500">{formState.errors.name?.message}</span>
        )}
      </div>
      <div className="form-control w-full max-w-xs">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <input
          className={`input input-md input-bordered grow ${
            !!formState.errors.description ? "input-error" : ""
          }`}
          type="text"
          disabled={isPosting}
          {...register("description")}
        />
        {formState.errors.description?.message && (
          <span className="text-red-500">
            {formState.errors.description?.message}
          </span>
        )}
      </div>
      <button className="btn btn-info flex w-24" type="submit" disabled={isPosting}>
        {isPosting ? "Creating..." : "Create"}
      </button>
    </form>
  );
};
