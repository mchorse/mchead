function to_a(arrayLike)
{
    return Array.prototype.slice.call(arrayLike);
}

/* Some basic DOOM stuff */

function $(selector, reference)
{
    return (reference || document).querySelector(selector);
}

function $$(selector, reference)
{
    return to_a((reference || document).querySelectorAll(selector));
}

function on(node, event, listener)
{
    node.addEventListener(event, listener);
}

module.exports =
{
    $: $,
    $$: $$,
    on: on
};