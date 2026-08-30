export function structure(S) {
  return S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Homepage")
        .id("homepage")
        .child(S.document().schemaType("homepage").documentId("homepage")),
      S.listItem()
        .title("Settings")
        .id("settings")
        .child(S.document().schemaType("settings").documentId("settings")),
      S.listItem()
        .title("Header menu")
        .id("headerMenu")
        .child(S.document().schemaType("headerMenu").documentId("headerMenu")),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
    ]);
}
