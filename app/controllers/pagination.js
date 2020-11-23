exports.getPagingData = (data, page, perPage) => {
  const { count: total, rows: contents } = data;
  const currentPage = page;
  const totalPages = Math.ceil(total / perPage);

  return { total, contents, totalPages, currentPage, perPage };
};
