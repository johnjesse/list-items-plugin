import { ListItemsMode } from "./Types";

interface IModeSelectorProps {
  mode: ListItemsMode;
  onModeChange(mode: ListItemsMode): void;
}

export function ModeSelector(props: IModeSelectorProps) {
  const { mode, onModeChange } = props;

  // TODO render Mode as content switcher
  // TODO render change
  return <div />;
}
