// @ts-check
/* global notebook */
/// <reference types="@i2analyze/notebook-sdk" />

async function main() {
  const api = await notebook.getEntryPointApi(
    "c9bac538-6595-4833-b86a-41dc28a8c07e",
    "1.0"
  );

  const listItems = api.createToolView("List items", "./");

  const commands = api.commands;

  const listItemsCommand = commands.createToolViewToggleCommand(
    {
      id: "ced9495e-9678-4944-97db-ae4cabadadbc",
      icon: {
        type: "inlineSvg",
        svg: `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
          <path d="M14 4a2 2 0 0 0-2 2c0 1 1 2 2 2a2 2 0 0 0 2-2c0-1-.8-2-2-2m4 2a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
          <text font-size="8" letter-spacing=".1" >
            <tspan x="3" y="10">1</tspan>
            <tspan x="3" y="20">2</tspan>
            <tspan x="3" y="30">3</tspan>
          </text>
          <path d="M26 23.2a2 2 0 0 0-2 2c0 1 .9 1.9 2 1.9a2 2 0 0 0 2-2c0-1-1-2-2-2m3.9 2a4 4 0 1 1-8 0 4 4 0 0 1 8 0" />
          <rect width="1.1" height="12.6" x="7.9" y="17.5" ry="0" transform="rotate(-32.4)"/>
        </svg>`,
      },
      name: "List items",
      keyboardHelp: {
        category: "discover",
        keys: ["d l"],
        label: "Toggle list items",
      },
    },
    listItems
  );

  const homeTab = commands.applicationRibbon.homeTab;
  homeTab
    .after(commands.systemCommands.toggleRecordInspector)
    .surfaceCommands(listItemsCommand);

  api.initializationComplete();
}

void main();
