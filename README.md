# 🍍 Pinapple - An old school Macintosh-inspired file system on the web

Pinapple is a browser-based file system that supports all file types. You can create folders, drag items, add, and delete. Just like you would on an old Macintosh. 

## Why does this exist?

This is a demonstration of what you can do with the [Pinata Files API](https://pinata.cloud). The entire app is powered by this API. There is no database, and the only other dependency is Clerk for authentication. 

Also, it's fun. 

## Building Pinapple

Hello, [Pinapple](https://pinapple.cloud).

Retro is always in. This is what I thought when I decided to show off [the Pinata Files API](https://pinata.cloud/blog/introducing-the-internets-files-api/) by building an in-browser replica of the classic Macintosh desktop. The goal was to have simple file management functionality. You could drag new files in, create folders, and move files and folders all around the desktop. And it would look like you were simply using a classic Macintosh, but in the browser. 

This isn’t going to be a full tutorial, but the code is available and it’s open source. Instead, this post will explore how I used the Pinata Files API to make this work. The entire app is built with just two dependencies—Clerk for authentication and Pinata for everything else. 

Before diving into how I built it, let’s talk about the name.

Pinapple is a play on Pinata (which powers the file management) and Apple (which is apple). I pronounce it pin-apple, but you can call it pineapple, if you’d prefer. I won’t judge you. 

Anyway, I want to talk a bit about the UI and then I’ll show off some of the nitty gritty code.  

### System.css

When I first had the idea to build a Macintosh-styled interface, I was desperately hoping there was a CSS library that made it simple. I did not like the idea of having to create such an interface while writing raw CSS myself. 

Fortunately, I came across [system.css](https://github.com/sakofchit/system.css/tree/main). The library is perfect. It doesn’t do a lot, but it does enough. And the look and feel is perfect for what I wanted to build. Rather than use a CDN or install the library from NPM, I just copied the CSS into the project’s main CSS file. This gave me flexibility. At least, that’s what I told myself, because I knew I wanted to combine system.css with Tailwind. 

### Tailwind CSS

For me, choosing Tailwind was simply an acceleration decision. I wanted to move fast with this project, and I could use Tailwind to handle a lot of what I consider boilerplate CSS, like font sizes and flex box positioning. 

Because Tailwind is configurable and compatible with any other CSS you write, I was able to write my own CSS for things a little more complex than I like to use Tailwind for, such as animations. I was also able to easily combine Tailwind with system.css. 

### Architecture

The architectural design of the app is pretty simple. Users would access their user profile (i.e. log in) and those user profiles would be associated with their specific files. It was important that users would not see each other’s files. So, when Alice logs in, she should not see Bob’s files. 

File uploads are handled by Pinata. Every file is stored using Pinata’s Private Files API. Users needed to be able to drag files from their actual desktop to this virtual in-browser desktop. I also wanted them to be able to click a button to upload, so I added a link to the main file menu in the interface’s menu bar. 

Folders are a critical part of a desktop, so users had to be able to create folders. To keep things simple, I limited folder creation to one level deep, so nested folders would not be permitted. When a folder is opened, users should be able to drag new files into the folder. They should also be able to re-arrange files in the folder. 

When users re-arranged files on the desktop or in a folder, the positions should be remembered, even if the user refreshes the browser. 

Finally, when a user double clicks (or right-clicks and selects open) a file, it should open in a window and be viewable if it’s an image or a video. Otherwise, it should download to the user’s computer. 

To manage all of this and ensure each person’s files and folders were specific to them, we used Clerk’s authentication middleware, and we scoped file uploads and folder creation to specific users. 

Let’s see some examples in code. 

### The Code

Again, this is not a tutorial, but we’ll look at some of the code for the project to get a sense for how the Pinata Files API enables everything I did in the app. 

#### One-time  use keys

In order to upload from the client side, I created an API endpoint dedicated to generating one-time use keys that the client could then use. 

Backend code: 

```jsx
let { userId } = getAuth(req)

if (!userId) {
  //  check if local test user
  const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
  if(!testUser) {
    return res.status(401).json({ error: 'Not authenticated' })
  } else {
    userId = req.headers.authorization?.split("Bearer ")[1] as string
  }     
}

const keyData = await pinata.keys.create({ keyName: `${userId}+${Date.now()}`, permissions: { admin: true }, maxUses: 1 })

res.json({ data: keyData.JWT });
```

There’s some middleware in there to check if the user is authenticated via our Clerk auth software or if they are signed in as a guest user. Otherwise, it’s a one-liner to generate a one-time use key. 

Frontend code: 

```jsx
const handleUpload = async (fileData: any, groupId?: string) => {
  try {
    let headers: any = {
      'Content-Type': 'application/json'
    }
    if(!user?.id) {
      headers.authorization = `Bearer ${getLocalUserId()}`
    }
    const keyRes = await fetch("/api/files", {
      method: "POST", 
      headers 
    })

    const keyData = await keyRes.json()
    const key = keyData.data;
    // Upload from the client
    if(groupId) {
      await pinata.upload.file(fileData).addMetadata({ name: `${user?.id}+${fileData.name}`, keyvalues: {
        userId: user?.id || getLocalUserId() || "", 
        testUser: user?.id ? "false" : "true"
      } }).group(groupId).key(key)
    } else {
      await pinata.upload.file(fileData).addMetadata({ name: `${user?.id}+${fileData.name}`, keyvalues: {
        userId: user?.id || getLocalUserId() || "", 
        testUser: user?.id ? "false" : "true"
      } }).key(key)
    }
  } catch (error) {
    throw error;
  }
}
```

The frontend does the heavy lifting. We are either uploading to a folder or simply adding a file to the “desktop.” This code has logic to support both. We use [Pinata’s Groups](https://pinata.cloud/blog/organize-your-ipfs-files-with-groups/) feature to create the illusion of folders. You can see how we attach a `groupId` if a file belongs in a folder. We also attach the one-time use key. 

Speaking of folders, let’s see how that works. 

#### Folders

Folders are simply Pinata Groups. But to make them unique across all users, I needed to do a little trickery. 

```jsx
const { groupName } = req.body
const { userId } = getAuth(req)

if (!userId) {
  //  check if local test user
  const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
  if(!testUser) {
    return res.status(401).json({ error: 'Not authenticated' })
  }        
}

await pinata.groups.create({ name: `${userId}+${groupName}` });
res.send("Success");
```

Because this app is built on top of my own Pinata developer account, I needed a way to distinguish groups for each user. If Alice creates a “Cats” group, Bob should also be able to create a group named “Cats.” This is where the concatenation of the userId allows for uniqueness. 

#### Dragging files into folders

I used the same drag and drop logic that allows the user to move their files and folders all over the desktop and extended it to detect if a file is dragged over a folder. If it is, then when it’s dropped while over that folder, this function is called: 

```jsx
const handleAddToFolder = async (fileId: string, folderId: string) => {
  let headers: any = {
    'Content-Type': 'application/json'
  }
  if(!user?.id) {
    headers.authorization = `Bearer ${getLocalUserId()}`
  }
  await fetch(`/api/groups`, {
    method: "PUT", 
    headers: headers, 
    body: JSON.stringify({
      fileId, 
      folderId
    })
  })

  loadFiles();
}
```

On the backend, I handle it like this: 

```jsx
const { userId } = getAuth(req)

if (!userId) {
  //  check if local test user
  const testUser = await getTestUser(req.headers.authorization?.split("Bearer ")[1] || "")
  if(!testUser) {
    return res.status(401).json({ error: 'Not authenticated' })
  }        
}

const { fileId, folderId } = req.body;
await pinata.groups.addFiles({groupId: folderId, files: [fileId] });
res.send("Success")
```

Pretty simple! One final trick I’ll show is how I make sure the files in groups do not show up on the desktop. This one is dead-simple. 

```jsx
await pinata.files.list().metadata({ userId: userId }).noGroup(true)
```

With this one line, I can list all the files for a user that are not in a folder (i.e. a group). 

### What’s next?

I don’t know, have fun with it. This was just a cool idea I had, and I was like “I bet I can build this in like a day.”

It took me two days, but you know how estimates go. 

The code is MIT-licensed, except for system.css which is Apache-licensed. So, go to town. Build your own Macintosh desktop, or do something completely different.

## Credits

The app is built using the incredible [system.css stylesheet](https://github.com/sakofchit/system.css/tree/main) and Tailwind CSS. Icons were created by scratch by Pinata's amazing designer, Marjorie Doucet, and made to look as close to original Macintosh icons as possible. 
