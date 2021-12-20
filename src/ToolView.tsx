import { useToolViewApi } from "./useToolViewApi";
import "./ToolView.scss";
import { ListItems } from "./ListItems";

export default function ToolView() {
  const toolViewApi = useToolViewApi();
  const themeClass = toolViewApi.theme.themeName;

  return (
    <div className={`${themeClass} base-theme`}>
      <ListItems />
    </div>
  );
}
