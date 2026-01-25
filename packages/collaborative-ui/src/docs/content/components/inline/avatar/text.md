Avatar displays a user's or entity's profile picture. When an image is not
specified, the user's initials are displayed on a colored background. The user
ID is consistently hashed to generate the same background color.

~~~<AvatarsPreview>
~~~

Provide user's image as the `src` prop.

~~~<Avatar>
{
  "width": 64,
  "src": "https://bafybeicwjfikrmhtjjfuthpk5zbs7sofwvgvoyr3oo7ligkrzm7fxfu53a.ipfs.nftstorage.link/5007.png"
}
~~~

```tsx
import {Avatar} from 'nice-ui/lib/inline/Avatar';

<Avatar width={64} src={''} />
```

If the image is not available, the
`name` prop is used to generate the initials and the `id` or the `name` props
will be used to generate the background color.

~~~<Avatar>
{
  "width": 64,
  "name": "Bumblebee~~~"
}
~~~
