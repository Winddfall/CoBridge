您需要将其所有面向用户的字符串都放入名为 messages.json 的文件中。每次添加新的语言区域时，您都会在名为 /_locales/_localeCode_ 的目录下添加一个消息文件，其中 localeCode 是一个代码，例如 en 表示英语。

以下是支持英语 (en)、西班牙语 (es) 和韩语 (ko) 的国际化扩展程序的文件夹层次结构：

在扩展程序目录中：manifest.json、*.html、*.js、/_locales 目录。在 /_locales 目录中：en、es 和 ko 目录，每个目录都包含一个 messages.json 文件。

支持多种语言
假设您有一个扩展程序，其中包含下图所示的文件：

一个 manifest.json 文件和一个包含 JavaScript 的文件。.json 文件包含“Hello World”。JavaScript 文件的标题为“Hello World”。

为了实现此扩展程序的国际化，您需要为每个面向用户的字符串命名，并将其放入消息文件中。扩展程序的清单、CSS 文件和 JavaScript 代码使用每个字符串的名称来获取其本地化版本。

以下是国际化后的扩展程序（请注意，它仍然只有英文字符串）：

在 manifest.json 文件中，“Hello World”已更改为“__MSG_extName__”，并且新的 default_locale&#39; 项的值为“en”。在 JavaScript 文件中，“Hello World”已更改为 chrome.i18n.getMessage(&#39;extName&#39;)。名为 /_locales/en/messages.json 的新文件定义了“extName”。

关于国际化的一些说明：

您可以使用任何受支持的语言区域。如果您使用的语言区域不受支持，Google Chrome 会忽略该语言区域。
在 manifest.json 和 CSS 文件中，按如下方式引用名为 messagename 的字符串：


__MSG_messagename__
在扩展程序或应用的 JavaScript 代码中，按如下方式引用名为 messagename 的字符串：


chrome.i18n.getMessage("messagename")
在每次对 getMessage() 的调用中，您最多可以提供 9 个要包含在消息中的字符串。如需了解详情，请参阅 示例：getMessage。

某些消息（例如 @@bidi_dir 和 @@ui_locale）由国际化系统提供。如需查看预定义消息名称的完整列表，请参阅预定义消息部分。

在 messages.json 中，每个面向用户的字符串都有一个名称、一个“message”项和一个可选的“description”项。该名称是一个键，例如“extName”或“search_string”，用于标识字符串。“message”指定相应语言区域中字符串的值。可选的“说明”可为翻译人员提供帮助，因为他们可能无法了解字符串在扩展程序中的使用方式。例如：


{
  "search_string": {
    "message": "hello%20world",
    "description": "The string we search for. Put %20 between words that go together."
  },
  ...
}
如需了解详情，请参阅格式：特定于语言区域的消息。

扩展程序国际化后，翻译起来非常简单。您复制 messages.json，对其进行翻译，然后将副本放入 /_locales 下的新目录中。例如，如需支持西班牙语，只需将 messages.json 的翻译副本放在 /_locales/es 下即可。下图显示了之前添加了新的西班牙语翻译的扩展程序。

此图与上图看起来相同，但 /_locales/es/messages.json 中有一个新文件，其中包含消息的西班牙语翻译。