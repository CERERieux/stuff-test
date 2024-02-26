import type { UserInfo } from "../../types";
import Button from "../SystemDesign/Button";

interface HeaderProfileProps {
  data: UserInfo;
  isUpdating: boolean;
  handleViewUpdateProfile: (data: UserInfo) => void;
}

/** Component that display user info like username, pfp and bio */
export default function HeaderProfile({
  data,
  handleViewUpdateProfile,
}: HeaderProfileProps) {
  return (
    <>
      <section className="h-full w-36 py-2">
        <h2 className="text-center">
          <span className="rounded-full bg-black/60 px-2 py-1 text-slate-50">
            {data.username}
          </span>
        </h2>
        {/** Replace with the actual image later */}
        <div className="mx-2 mt-2 flex h-32 w-32 items-center justify-center rounded-full bg-slate-50">
          {data.img}
        </div>
      </section>
      {
        <article className="relative my-2 mr-4 flex w-full flex-col lg:mr-6">
          <h3>About me:</h3>
          {data.bio !== "" ? (
            <p className="h-[65%] w-full overflow-y-auto text-pretty rounded-md border border-slate-600 px-2 py-1 sm:h-[61%] lg:py-0">
              {data.bio}
            </p>
          ) : (
            <p className="text-pretty italic">
              (Update your profile, you can tell us a bit about you here!)
            </p>
          )}
          <Button
            color="absolute bottom-4 md:bottom-0 bg-blue-300 border-blue-500 hover:bg-blue-600 hover:border-blue-300 shadow-md shadow-black/20 active:shadow-none transition-all"
            xSize="w-36"
            onClick={() => {
              handleViewUpdateProfile(data);
            }}
          >
            Update profile
          </Button>
        </article>
      }
    </>
  );
}