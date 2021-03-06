/* eslint-disable
  object-property-newline,
  no-useless-constructor,
*/

const Document = require('../../models/document');
const md = require('markdown').markdown;

const makeSubclass = (data, props) => {

  class Subclass extends Document {
    constructor(data, properties) {
      super(data, properties);
    }
  }

  return new Subclass(data, props);

};

describe('Document', function DocumentTest() {

  it('new Document()', function newDocument() {
    const badTimestamp = () => new Document({ type: 'test', _ts: new Date() });
    const badTTL = () => new Document({});
    const noData = () => new Document();
    const notObject = () => new Document(true);
    const notString = () => new Document({ type: 'test', id: 12345 });
    const noType = () => new Document({});

    expect(badTimestamp).toThrow();
    expect(badTTL).toThrow();
    expect(noData).toThrow();
    expect(notObject).toThrow();
    expect(notString).toThrow();
    expect(noType).toThrow();

    const data = {
      type: 'test',
      testProperty: 'test value',
    };

    const doc = new Document(data);

    expect(doc instanceof Document).toBe(true);
    expect(doc.testProperty).toBe(data.testProperty);

  });

  it('Document.prototype.id', function idAttr() {

    const data = {
      id: 'testid',
      type: 'test',
    };

    const doc = new Document(data);

    const badid = () => new Document({ type: 'test', id: 2 });

    doc.id = 'newid';

    expect(doc.id).toBe(data.id);
    expect(Object.getOwnPropertyDescriptor(doc, 'id').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(doc, 'id').enumerable).toBe(true);
    expect(badid).toThrow();

  });

  it('Document.prototype.cvid', function cvidAttr() {

    const data = {
      type: 'test',
      cvid: 2,
    };

    const doc = new Document(data);
    const badCVID1 = () => new Document({ type: 'test', cvid: 0 });
    const badCVID2 = () => new Document({ type: 'test', cvid: '2' });

    doc.cvid = 3;

    expect(doc.cvid).toBe(data.cvid);
    expect(Object.getOwnPropertyDescriptor(doc, 'cvid').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(doc, 'cvid').enumerable).toBe(true);
    expect(badCVID1).toThrow();
    expect(badCVID2).toThrow();

  });

  it('Document.prototype.ttl', function ttlAttr() {

    const data = { type: 'test' };
    const doc = new Document(data);

    const configureTTL = () => {
      Object.defineProperty(doc, 'ttl', { configurable: true });
    };

    expect(configureTTL).toThrow();

  });

  it('Document.prototype.type', function typeAttr() {

    const data = { type: 'test' };

    const doc = new Document(data);

    const configureType = () => {
      Object.defineProperty(doc, 'type', { value: 'newtype' });
    };

    expect(doc.ttl).toBeUndefined();
    expect(doc.type).toBe(data.type);
    expect(configureType).toThrow();

    doc.ttl = 1;
    expect(doc.ttl).toBe(1);

  });

  it('Document.whitelist', function whitelistAttr() {

    const whitelist = [
      'id',
      'type',
      '_attachments',
      '_etag',
      '_rid',
      '_self',
      '_ts',
      'ttl',
    ];

    whitelist.forEach(attr => {
      expect(Document.whitelist.includes(attr)).toBe(true);
    });

    const doc = new Document({ type: 'test' });

    for (const attr in doc) {
      if (!whitelist.includes(attr)) fail(`The "${attr}" attribute is not whitelisted.`);
    }

  });

  it('Subclass.abbreviation', function abbrAttr() {

    const data = {
      type: 'test',
      abbreviation: 'MT',
    };

    const subclass = makeSubclass(data, 'abbreviation');

    const setBadAbbr = () => { subclass.abbreviation = 'BAD ABBR'; };
    expect(setBadAbbr).toThrow();
    const newAbbr = 'NEWABBR';
    subclass.abbreviation = newAbbr;
    expect(subclass.abbreviation).toBe(newAbbr);

  });

  it('Subclass.achievements', function achievementsAttr() {

    const data = {
      type: 'test',
      achievements: [
        'This is this.',
        'And that is that.',
      ],
    };

    const subclass = makeSubclass(data, 'achievements');

    const arr = [];

    expect(Array.isArray(subclass.achievements)).toBe(true);
    expect(Object.getOwnPropertyDescriptor(subclass, 'achievements').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'achievements').enumerable).toBe(true);
    expect(subclass.achievements.length).toBe(2);

    subclass.achievements = arr;
    expect(subclass.achievements).not.toBe(arr);

    let ach = 'I did lots of cool things.';
    let len = subclass.achievements.length;

    subclass.addAchievement(ach);
    expect(subclass.achievements.length).toBe(len + 1);
    expect(subclass.achievements.includes(ach)).toBe(true);

    len = subclass.achievements.length;
    ach = data.achievements[0];

    subclass.removeAchievement(ach);
    expect(subclass.achievements.length).toBe(len - 1);

  });

  it('Subclass.categories', function categoriesAttr() {

    const data = {
      type: 'test',
      categories: ['test'],
    };

    const subclass = makeSubclass(data, 'categories');

    const badCategories1 = () => {
      const data = { type: 'test', categories: 'test' };
      const subclass = makeSubclass(data, 'categories');
      expect(subclass.categories.length).toBe(0);
    };

    const badCategories2 = () => {
      const data = { type: 'test', categories: [true, 'test'] };
      makeSubclass(data, 'categories');
    };

    const noCategories = () => {
      const data = { type: 'test' };
      const subclass = makeSubclass(data, 'categories');
      expect(Array.isArray(subclass.categories)).toBe(true);
      expect(subclass.categories.length).toBe(0);
    };

    const nullCategories = () => {
      const data = { type: 'test', categories: null };
      makeSubclass(data, 'categories');
    };

    const emptyCategories = () => {
      const data = { type: 'test', categories: [] };
      makeSubclass(data, 'categories');
    };

    const setBadCategory = () => {
      subclass.addCategory(true);
    };

    expect(Array.isArray(subclass.categories)).toBe(true);
    expect(subclass.addCategory).toBeDefined();
    expect(subclass.hasCategory).toBeDefined();
    expect(subclass.removeCategory).toBeDefined();
    expect(subclass.categories.includes('test')).toBe(true);
    expect(badCategories1).not.toThrow();
    expect(badCategories2).toThrow();
    expect(emptyCategories).not.toThrow();
    expect(noCategories).not.toThrow();
    expect(nullCategories).not.toThrow();
    expect(setBadCategory).toThrow();

    subclass.categories.push('addCategory');
    expect(subclass.categories.includes('addCategory')).toBe(false);

    subclass.addCategory('addCategory');
    subclass.removeCategory('test');
    expect(subclass.categories.includes('test')).toBe(false);
    expect(subclass.categories.includes('addCategory')).toBe(true);
    expect(subclass.hasCategory('test')).toBe(false);
    expect(subclass.hasCategory('addCategory')).toBe(true);

  });

  it('Subclass.date', function dateAttr() {

    const data = {
      type: 'test',
      date: '2016-10-1',
    };

    const subclass = makeSubclass(data, 'date');

    expect(subclass.date instanceof Date).toBe(true);
    expect(subclass.date).not.toBe(new Date(data.date));
    expect(subclass.date.toString()).toBe(new Date(data.date).toString());

    subclass.date = 2016;
    expect(subclass.date.toString()).toBe(new Date(2016).toString());
    subclass.date = '2016';
    expect(subclass.date.toString()).toBe(new Date('2016').toString());

  });

  it('Subclass.description', function descriptionAttr() {

    const data = {
      type: 'test',
      description: 'This is a description.',
    };

    const subclass = makeSubclass(data, 'description');
    expect(Object.getOwnPropertyDescriptor(subclass, 'description').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'description').enumerable).toBe(false);
    expect(subclass.description).toBe(data.description);

    const newDescription = 'This is the new description.';

    const badDescription = () => {
      const subclass = makeSubclass({ type: 'test', description: 2 }, 'description');
      expect(subclass.description).toBe('2');
    };
    const noDescription = () => {
      const subclass = makeSubclass({ type: 'test' }, 'description');
      expect(subclass.description).toBe('');
    };
    const setNumericDescription = () => {
      subclass.description = 2;
      expect(subclass.description).toBe('2');
    };
    const setNullDescription = () => {
      subclass.description = null;
      expect(subclass.description).toBe('null');
    };
    const setUndefinedDescription = () => {
      subclass.description = undefined;
      expect(subclass.description).toBe('undefined');
    };

    subclass.description = newDescription;

    subclass.html = '<p></p>';
    expect(subclass.html).toBe(md.toHTML(newDescription));

    subclass.markdown = 'This is *emphatic*.';
    expect(subclass.markdown).toBe(newDescription);

    expect(subclass.description).toBe(newDescription);
    expect(subclass.markdown).toBe(newDescription);
    expect(subclass.html).toBe(md.toHTML(newDescription));
    expect(badDescription).not.toThrow();
    expect(noDescription).not.toThrow();
    expect(setNumericDescription).not.toThrow();
    expect(setNullDescription).not.toThrow();
    expect(setUndefinedDescription).not.toThrow();

  });

  it('Subclass.endYear', function endYearAttr() {

    const data = {
      type: 'test',
      endYear: 2016,
    };

    const subclass = makeSubclass(data, 'endYear');

    const setBadInteger = () => { subclass.endYear = 2; };
    const setBadString = () => { subclass.endYear = 'now'; };
    const setEmptyString = () => { subclass.endYear = ''; };
    const setUndefined = () => { subclass.endYear = undefined; };

    expect(subclass.endYear).toBe(data.endYear);
    expect(Object.getOwnPropertyDescriptor(subclass, 'endYear').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'endYear').enumerable).toBe(true);
    expect(setBadInteger).toThrow();
    expect(setBadString).toThrow();
    expect(setEmptyString).not.toThrow();
    expect(setUndefined).not.toThrow();


  });

  it('Subclass.links', function linksAttr() {

    const data = {
      type: 'test',
      links: { webpage: 'http://danielhieber.com' },
    };

    const subclass = makeSubclass(data, 'links');

    expect(subclass.links).toBeDefined();
    expect(subclass.addLink).toBeDefined();
    expect(subclass.getLink).toBeDefined();
    expect(subclass.removeLink).toBeDefined();
    expect(Object.getOwnPropertyDescriptor(subclass, 'links').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'links').enumerable).toBe(true);
    expect(subclass.getLink('webpage')).toBe(data.links.webpage);

    const newLink = 'http://new.com';

    subclass.links.newLink = newLink;
    expect(subclass.links.newLink).toBeUndefined();

    subclass.links = {};
    expect(subclass.links.webpage).toBeDefined();

    subclass.addLink('newLink', newLink);
    expect(subclass.links.newLink).toBe(newLink);

    subclass.removeLink('newLink');
    expect(subclass.links.newLink).toBeUndefined();

    const badLink = () => {
      const subclass = makeSubclass({ type: 'test', links: { site: 2 } }, 'links');
    };
    const badLinks = () => {
      const subclass = makeSubclass({ type: 'test', links: 'link' }, 'links');
      expect(Object.keys(subclass.links).length).toBe(0);
    };
    const noLinks = () => {
      const subclass = makeSubclass({ type: 'test' }, 'links');
      expect(Object.keys(subclass.links).length).toBe(0);
    };
    const setBadLinkName = () => { subclass.addLink(2, newLink); };
    const setBadUrl = () => { subclass.addLink('badUrl', 'badlink.com'); };

    expect(badLink).toThrow();
    expect(badLinks).not.toThrow();
    expect(noLinks).not.toThrow();
    expect(setBadLinkName).toThrow();
    expect(setBadUrl).toThrow();

  });

  it('Subclass.{stringProperty}', function titleAttr() {

    const data = {
      type: 'test',
      location: 'Santa Barbara, CA',
    };

    const subclass = makeSubclass(data, 'location');

    const nonStringLoc = () => {
      const subclass = makeSubclass({ type: 'test', location: 2 }, 'location');
      expect(subclass.location).toBe(String(2));
    };
    const setNonStringLoc = () => {
      subclass.location = 2;
      expect(subclass.location).toBe(String(2));
    };

    expect(subclass.location).toBe(data.location);
    expect(Object.getOwnPropertyDescriptor(subclass, 'location').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'location').enumerable).toBe(true);
    expect(nonStringLoc).not.toThrow();
    expect(setNonStringLoc).not.toThrow();

  });

  it('Subclass.startYear', function startYearAttr() {

    const data = {
      type: 'test',
      startYear: 2016,
    };

    const subclass = makeSubclass(data, 'startYear');

    const setBadInteger = () => { subclass.startYear = 2; };
    const setNonInteger = () => { subclass.startYear = null; };

    expect(subclass.startYear).toBe(data.startYear);
    expect(Object.getOwnPropertyDescriptor(subclass, 'startYear').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'startYear').enumerable).toBe(true);
    expect(setBadInteger).toThrow();
    expect(setNonInteger).toThrow();


  });

  it('Subclass.year', function yearAttr() {

    const data = {
      type: 'test',
      year: 2016,
    };

    const subclass = makeSubclass(data, 'year');

    const badYear = () => {
      makeSubclass({ type: 'test', year: true }, 'year');
    };
    const noYear = () => {
      const subclass = makeSubclass({ type: 'test' }, 'year');
      expect(subclass.year).toBeUndefined();
    };
    const setBadYear1 = () => { subclass.year = 1985; };
    const setBadYear2 = () => { subclass.year = undefined; };

    expect(subclass.year).toBe(data.year);
    expect(Object.getOwnPropertyDescriptor(subclass, 'year').configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptor(subclass, 'year').enumerable).toBe(true);
    expect(badYear).toThrow();
    expect(noYear).not.toThrow();
    expect(setBadYear1).toThrow();
    expect(setBadYear2).toThrow();

    subclass.year = 1986;
    expect(subclass.year).toBe(1986);

  });

});
