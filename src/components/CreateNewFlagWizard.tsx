import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { type FormEvent } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { convertFlagNameToKey } from "../utils/convertFlagNameToKey";

type CreateNewFlagWizardProps = {
  flagKeys: string[];
};

export const CreateNewFlagWizard: React.FC<CreateNewFlagWizardProps> = ({
  flagKeys,
}) => {
  const { isSignedIn } = useUser();
  const flagFormSchema = z.object({
    name: z
      .string()
      .min(1, "Name must be at least 1 character long")
      .refine(
        (name) => !flagKeys.includes(convertFlagNameToKey(name)),
        "Name must be unique",
      ),
  });
  const { register, reset, handleSubmit, formState } = useForm<
    z.infer<typeof flagFormSchema>
  >({
    resolver: zodResolver(flagFormSchema),
  });

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.flags.create.useMutation({
    onSuccess: async () => await ctx.flags.getAll.invalidate(),
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong");
      }
    },
    onSettled: () => reset({ name: "" }),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => {
      mutate(data);
    })(event);
  };

  if (!isSignedIn) return null;

  return (
    <form className="flex w-full flex-col gap-3" onSubmit={onSubmit}>
      <span>Create new feature flag</span>
      <TextField
        label="Flag Name"
        className="grow bg-white"
        type="text"
        disabled={isPosting}
        error={!!formState.errors.name}
        {...register("name")}
      />
      {formState.errors.name?.message && (
        <span className="text-red-500">{formState.errors.name?.message}</span>
      )}
      <Button
        variant="contained"
        type="submit"
        disabled={isPosting}
        className="flex w-24"
      >
        Create{" "}
        {isPosting && (
          <div className="flex items-center justify-center">...</div>
        )}
      </Button>
    </form>
  );
};
