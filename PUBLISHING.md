# מדריך פרסום - n8n-nodes-fireberry

## מבנה הפרויקט שנוצר

```
n8n-nodes-fireberry/
├── package.json              # הגדרות החבילה
├── tsconfig.json            # הגדרות TypeScript
├── .eslintrc.js            # הגדרות ESLint
├── gulpfile.js             # Build script לאייקונים
├── README.md               # תיעוד המשתמש
├── LICENSE                 # רישיון MIT
├── credentials/
│   └── FireberryApi.credentials.ts
├── nodes/
│   └── Fireberry/
│       ├── Fireberry.node.ts
│       ├── Fireberry.node.json
│       ├── GenericFunctions.ts
│       ├── types.ts
│       ├── fireberry.svg
│       └── descriptions/
│           ├── AccountDescription.ts
│           ├── ContactDescription.ts
│           ├── CaseDescription.ts
│           ├── TaskDescription.ts
│           └── QueryDescription.ts
└── dist/                   # קבצים מקומפלים (נוצר אוטומטית)
```

## שלב 1: בדיקה מקומית

### התקנה מקומית ב-n8n

```bash
# Build הפרויקט
npm run build

# קישור החבילה באופן גלובלי
npm link

# התקנה ב-n8n המקומי שלך
cd ~/.n8n
npm link n8n-nodes-fireberry

# הפעלת n8n
n8n start
```

### בדיקה שהכל עובד:

1. פתח את n8n בדפדפן (http://localhost:5678)
2. צור workflow חדש
3. חפש "Fireberry" ברשימת ה-nodes
4. הוסף את ה-Fireberry node
5. הגדר credentials עם ה-API Token שלך
6. נסה ליצור Account או Contact חדש
7. נסה Query operation

## שלב 2: בדיקת איכות

```bash
# הרץ linting
npm run lint

# תקן בעיות אוטומטיות
npm run lintfix

# פורמט הקוד
npm run format
```

## שלב 3: עדכון הגרסה

ערוך את `package.json` ועדכן את מספר הגרסה:

```json
{
  "version": "1.0.0"  // שנה ל-1.0.1, 1.1.0, וכו' לפי הצורך
}
```

## שלב 4: העלאה ל-GitHub

```bash
# הוספת קבצים ל-staging
git add .

# יצירת commit
git commit -m "Initial release - v1.0.0

✅ תמיכה ב-CRUD operations (Account, Contact, Case, Task)
✅ Query מתקדם עם פילטרים
✅ Custom Fields דינמיים
✅ Pagination אוטומטי
✅ טיפול משופר בשגיאות"

# העלאה ל-GitHub
git push -u origin master

# יצירת tag לגרסה
git tag v1.0.0
git push origin v1.0.0
```

## שלב 5: פרסום ל-NPM

### התחברות ל-NPM (פעם אחת)

```bash
npm login
```

הזן:
- Username: שם המשתמש שלך ב-NPM
- Password: הסיסמה
- Email: האימייל שלך

### פרסום החבילה

```bash
# וודא שהכל נבנה
npm run build

# פרסום
npm publish --access public
```

**חשוב:** החבילה תהיה זמינה ב-https://www.npmjs.com/package/n8n-nodes-fireberry

## שלב 6: רישום ב-n8n Community

1. גש ל-[n8n Community Nodes](https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/)
2. מלא את הטופס:
   - **Package Name**: `n8n-nodes-fireberry`
   - **npm URL**: `https://www.npmjs.com/package/n8n-nodes-fireberry`
   - **GitHub URL**: `https://github.com/binesamit/n8n-nodes-fireberry`
   - **Description**: n8n node for Fireberry CRM (formerly Powerlink)
   - **Categories**: CRM, Israel
3. שלח את הטופס

## התקנה על ידי משתמשים

לאחר הפרסום, משתמשים יוכלו להתקין את החבילה:

### דרך ממשק n8n (מומלץ)

1. Settings > Community Nodes
2. Install
3. הזן: `n8n-nodes-fireberry`
4. Install

### דרך npm

```bash
npm install n8n-nodes-fireberry
```

## עדכונים עתידיים

כאשר תרצה לפרסם גרסה חדשה:

1. עדכן את הקוד
2. הרץ `npm run build`
3. עדכן את הגרסה ב-`package.json`
4. צור commit ו-tag חדש
5. `npm publish`

## פתרון בעיות

### השגיאה "Package already exists"
פירושה שהשם תפוס. צריך לבחור שם אחר.

### השגיאה "No permission to publish"
ודא שאתה מחובר עם `npm whoami`

### החבילה לא מופיעה ב-n8n
1. ודא ש-n8n הופעל מחדש
2. בדוק ש-`package.json` מכיל את המפתח `n8n` הנכון
3. ודא שהקבצים ב-`dist/` קיימים

## תכונות להוספה בעתיד

### גרסה 1.1:
- [ ] תמיכה ב-Webhooks
- [ ] Batch operations
- [ ] העלאת קבצים

### גרסה 1.2:
- [ ] Rate limiting handling
- [ ] Retry logic
- [ ] Cache של metadata

### גרסה 2.0:
- [ ] Trigger node
- [ ] Relationship management
- [ ] Reports generation

## תמיכה

- GitHub Issues: https://github.com/binesamit/n8n-nodes-fireberry/issues
- n8n Community: https://community.n8n.io/

---

**בהצלחה! 🚀**
