import { MoonLoader } from "react-spinners";

export default function Loader({ loading }) {
  return (
    <MoonLoader
      loading={loading}
      size={20}
      color="rgb(90 155 103)"
      aria-label="Loading Spinner"
      data-testid="loader"
    />
  );
}
