import SettingLayout from "@/layouts/SettingsLayout";
import { PAGE_METADATA } from "@/lib/constants/metadata";
import Wallet from "@/modules/wallet";

export const metadata = PAGE_METADATA.WALLET;

const WalletPage = async () => {
    return <Wallet />;
};

export default WalletPage;
