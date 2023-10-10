import Head from "next/head";
import { SignInButton, useClerk, useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import FeatureFlagTable from "../components/FeatureFlagTable";
import { CreateNewFlagWizard } from "../components/CreateNewFlagWizard";
import Loader from "../components/Loader";

export default function Home() {
  const { isSignedIn, isLoaded: userLoaded, user } = useUser();
  const { signOut } = useClerk();

  const { data } = api.flags.getAll.useQuery();

  if (!userLoaded)
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader />
        <div>Loading ...</div>
      </div>
    );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className="flex min-h-screen flex-col items-center justify-center"
        data-theme="cupcake"
      >
        <div className="flex w-[1024px] min-w-[1024px] max-w-full flex-col justify-stretch gap-4 p-4">
          {!isSignedIn && (
            <>
              <div>Please login:</div>
              <div className="flex justify-end gap-4 align-baseline">
                <span className="btn">
                  <SignInButton />
                </span>
              </div>
            </>
          )}
          {isSignedIn && (
            <>
              <div>Welcome {user?.firstName ?? user?.username}!</div>
              <div className="flex justify-end gap-4 align-baseline">
                <button className="btn" onClick={() => void signOut()}>
                  Sign Out
                </button>
              </div>
              <div className="flex flex-col justify-center gap-4 align-middle">
                {data ? <FeatureFlagTable rows={data} /> : <Loader />}
              </div>
              <CreateNewFlagWizard
                flagKeys={data ? data?.map(({ flag }) => flag.key) : []}
              />
            </>
          )}
        </div>
      </main>
    </>
  );
}
