import { zodResolver } from "@hookform/resolvers/zod";
import { type inferRouterOutputs } from "@trpc/server";
import { useState, type FormEvent } from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { type FlagsRouter } from "../server/api/routers/flags";
import { api } from "../utils/api";

export type Flags = inferRouterOutputs<FlagsRouter>["getAll"];

export type FeatureFlagRowProps = {
  row: Flags[number];
};

const FeatureFlagRow: React.FC<FeatureFlagRowProps> = ({
  row: { flag, updatedByUser },
}) => {
  const [isEditable, setIsEditable] = useState(false);

  const toggleFlagSchema = z.object({
    id: z.number(),
    development: z.boolean().optional(),
    staging: z.boolean().optional(),
    production: z.boolean().optional(),
  });

  const { handleSubmit, control } = useForm<z.infer<typeof toggleFlagSchema>>({
    values: {
      id: flag.id,
      development: flag.development,
      staging: flag.staging,
      production: flag.production,
    },
    resolver: zodResolver(toggleFlagSchema),
  });

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.flags.toggle.useMutation({
    onSuccess: async () => {
      await ctx.flags.getAll.invalidate();
      toast.success("Saved flag");
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage?.[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong");
      }
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleSubmit((data) => mutate(data))(event);
  };

  const handleKeyClick = async (key: string) => {
    await navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard");
  };

  return (
    <tr key={flag.key}>
      <td scope="row">
        <div className="tooltip tooltip-right" data-tip={flag.description}>
          {flag.name}
        </div>
      </td>
      <td>
        <button onClick={() => void handleKeyClick(flag.key)}>
          {flag.key}
        </button>
      </td>
      <td>
        <div>
          <span>{flag.updatedAt.toLocaleDateString("en-GB")}{" "}</span>
          <span>by{" "}</span>
          <a
            href={`https://github.com/${updatedByUser?.username}`}
            className="text-blue-500"
          >
            @{updatedByUser?.username}
          </a>
        </div>
      </td>
      <td align="right">
        <form onSubmit={onSubmit}>
          <div className="flex gap-4">
            <span className="flex w-16 flex-col justify-center text-center align-middle">
              <Controller
                control={control}
                name="development"
                render={({ field }) => {
                  if (!isEditable) {
                    if (field.value) {
                      return <span className="text-green-500">Yes</span>;
                    }
                    return <span className="text-red-500">No</span>;
                  }
                  return (
                    <input
                      className="toggle toggle-info m-auto"
                      disabled={field.disabled}
                      name={field.name}
                      type="checkbox"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      checked={field.value}
                    />
                  );
                }}
              />
            </span>
            <span className="flex w-16 flex-col justify-center text-center align-middle">
              <Controller
                control={control}
                name="staging"
                render={({ field }) => {
                  if (!isEditable) {
                    if (field.value) {
                      return <span className="text-green-500">Yes</span>;
                    }
                    return <span className="text-red-500">No</span>;
                  }
                  return (
                    <input
                      className="toggle toggle-info m-auto"
                      disabled={field.disabled}
                      name={field.name}
                      type="checkbox"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      checked={field.value}
                    />
                  );
                }}
              />
            </span>
            <span className="flex w-16 flex-col justify-center text-center align-middle">
              <Controller
                control={control}
                name="production"
                render={({ field }) => {
                  if (!isEditable) {
                    if (field.value) {
                      return <span className="text-green-500">Yes</span>;
                    }
                    return <span className="text-red-500">No</span>;
                  }
                  return (
                    <input
                      className="toggle toggle-info m-auto"
                      disabled={field.disabled}
                      name={field.name}
                      type="checkbox"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      checked={field.value}
                    />
                  );
                }}
              />
            </span>
            <span className="ml-auto w-20">
              <button
                className="btn btn-info btn-sm"
                type={isEditable ? "button" : "submit"}
                onClick={() => setIsEditable((e) => !e)}
              >
                {isEditable ? "Done" : "Edit"}
              </button>
            </span>
          </div>
        </form>
      </td>
    </tr>
  );
};

export default FeatureFlagRow;
