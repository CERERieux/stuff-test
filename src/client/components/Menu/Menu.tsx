import { useNavigate } from "react-router-dom";
import { CloseNavButton } from "../SystemDesign/CloseNavButton";
import { useUser } from "../../store/user";
import { Suspense, lazy, useState } from "react";
import LoadingSpinner from "../NotFound/LoadingSpinner";
import { useSettingStore } from "../../store/settingPortfolio";
import ButtonEnEs from "./ButtonEnEs";
import DarkLightButton from "./DarkLightButton";

const MainMenu = lazy(() => import("./MainMenu"));
const SubMenuProfile = lazy(() => import("./SubMenuProfile"));
const SubMenuDemo = lazy(() => import("./SubMenuDemo"));
const SubMenuGame = lazy(() => import("./SubMenuGame"));

interface MenuProps {
  opacity: string;
  handleOpacity: () => void;
}

export default function Menu({ opacity, handleOpacity }: MenuProps) {
  const { username, logoffUser } = useUser();
  const [menu, setMenu] = useState("MainMenu");
  const navigate = useNavigate();
  const { i18n } = useSettingStore();
  const title = i18n === "English" ? "Main Menu" : "Menu Principal";

  const handleLogoff = () => {
    logoffUser();
    navigate("/home");
  };

  return (
    <section
      className={`absolute right-0 top-0 h-full w-full overflow-y-auto bg-gradient-to-b from-slate-100/80 to-slate-950/80 py-8 text-white backdrop-blur-sm dark:from-slate-500/80 dark:to-black/90 dark:to-85% md:w-3/5 lg:w-1/2 ${opacity} flex flex-col items-center justify-center gap-4 shadow-xl shadow-black/40 transition-all duration-500 ease-in-out`}
    >
      <h2 className="text-2xl text-black first-letter:text-3xl dark:text-slate-200">
        {title}
      </h2>
      <Suspense fallback={<LoadingSpinner />}>
        {menu === "MainMenu" ? (
          <MainMenu
            username={username}
            handleLogoff={handleLogoff}
            setMenu={setMenu}
          />
        ) : menu === "Profile" ? (
          <SubMenuProfile setMenu={setMenu} />
        ) : menu === "Demos" ? (
          <SubMenuDemo setMenu={setMenu} />
        ) : (
          <SubMenuGame setMenu={setMenu} />
        )}
      </Suspense>
      <CloseNavButton handleOpacity={handleOpacity} bgColor="bg-white" />
      <ButtonEnEs />
      <DarkLightButton />
    </section>
  );
}
