class QueryBuilder {
  constructor({ model, searchFields, sortKey }) {
    this.model = model;
    this.query = {};
    this.pagination = {};
    this.searchFields = searchFields || [];
    this.sortKey = sortKey || '';
    this.populateOptions = [];
  }

  filter(filterObject) {
    if (filterObject.search) {
      const searchRegex = {
        $regex: filterObject.search.trim(),
        $options: 'i',
      };
      this.query.find = {
        $or: this.searchFields.map((field) => ({
          [field]: searchRegex,
        })),
      };
      delete filterObject.search;
    }

    for (const key in filterObject) {
      if (Object.hasOwnProperty.call(filterObject, key)) {
        const element = filterObject[key];
        if (element) {
          this.query.find = {
            ...this.query.find,
            [key]: element,
          };
        }
      }
    }

    return this;
  }

  sort(sortOption) {
    const sortOptions = {
      latest: '-createdAt',
      oldest: 'createdAt',
      highest: { [this.sortKey]: 1 },
      lowest: { [this.sortKey]: -1 },
    };

    this.query.sort = sortOptions[sortOption] || '-createdAt';

    if (sortOption === 'a-z' || sortOption === 'z-a') {
      this.query.collation = { locale: 'en' };
    } else {
      delete this.query.collation;
    }

    return this;
  }

  paginate(pageNumber, pageSize) {
    this.pagination = {
      page: Math.max(1, pageNumber || 1),
      pageSize: Math.max(1, pageSize || 12),
    };
    return this;
  }

  populate(path, options) {
    this.populateOptions.push({ path, options });
    return this;
  }

  async execute() {
    const { page, pageSize } = this.pagination;
    const skip = (page - 1) * pageSize;

    let query = this.model
      .find(this.query.find)
      .sort(this.query.sort)
      .collation(this.query.collation)
      .skip(skip)
      .limit(pageSize);

    this.populateOptions.forEach(({ path, options }) => {
      if (options.populate) {
        query = query.populate({ path, ...options });
      } else {
        query = query.populate(path, options);
      }
    });

    const [results, totalCount] = await Promise.all([
      query.exec(),
      this.model.countDocuments(this.query.find),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return { results, totalCount, totalPages };
  }
}

module.exports = { QueryBuilder };
