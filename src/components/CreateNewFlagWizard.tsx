import { useUser } from "@clerk/nextjs";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { useForm } from "react-hook-form";
import { type FormEvent } from "react";
import TextField from "@mui/material/TextField";
import { Button } from "@mui/material";

export const CreateNewFlagWizard = () => {
  const { isSignedIn } = useUser();
  const { register, reset, handleSubmit } = useForm<{
    name: string;
  }>();

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
        {...register("name")}
      />
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
