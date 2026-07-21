# idyia

A simple "airtable" website that lists companies that use generative AI. It should have all the basic features of Airtable, i.e badges, sorting by field, search.

## Design

Very minimalistic, white and black, white for background and black/gray for borders.

## Loading

Data should be loaded X amount at a time, i.e 10/50/100 with scrolling loading more into the table.

## Data

The table has the following information:
- Company Name (prettified name if used)
- Registered Company (i.e OÜ) with a link if a registry exists
- Website Link
- Regex for website url's (used for browser extension/tamper monkey script), hidden on UI
- Company Type (i.e restaurant, SaaS, government/institution)
- Description (i.e what was generated, "Used GAI for marketing posters"
- Company Sizes using Company Size codes
- Image Url / Origin (X link, blog post, archive link)

## Company Size Codes

Code	Description
A	Self-employed
B	1-10 employees
C	11-50 employees
D	51-200 employees
E	201-500 employees
F	501-1000 employees
G	1001-5000 employees
H	5001-10,000 employees
I	10,001+ employees


## Database

I want to use turso for the database since it scales quite well and has high limits, even though we have high limits we should still use the MINIMAL amount of queries.


## Users

You should be able to create an account with an email/username or oauth i.e discord, then you are given the Contributor role. The admin (me) can provide users the Moderator role, which allows Moderators to approve/deny/modify Contributor made entries. Contributor created entries SHOULD NOT be publicly visible. A user can also be a Trusted Contributor where the inserted data goes straight into the table.

