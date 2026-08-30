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
      S.listItem()
        .title("Footer menu")
        .id("footerMenu")
        .child(S.document().schemaType("footerMenu").documentId("footerMenu")),
      S.divider(),
      S.listItem()
        .title("Article listing")
        .id("articleListing")
        .child(
          S.document()
            .schemaType("articleListing")
            .documentId("articleListing"),
        ),
      S.documentTypeListItem("article").title("Articles"),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
    ]);
}
