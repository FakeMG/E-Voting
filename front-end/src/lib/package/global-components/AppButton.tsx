type AppButtonProps = {
  title: string;
  handler: () => void;
};

export default function AppButton(props: AppButtonProps) {
  const { title, handler } = props;

  return (
    <div
      className="px-6 py-3 inline-block bg-primary-500 cursor-pointer rounded-md hover:scale-110 ease-in duration-100"
      onClick={handler}
    >
      <div className="text-base text-white text-center">{title}</div>
    </div>
  );
}
