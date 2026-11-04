// The kit's tests. Don't edit them. A global allocator that counts every
// allocation in this test binary, to prove the scanner copies nothing.
use scanner::{Scanner, Tokens};
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};

struct Counting;
static ALLOCATIONS: AtomicUsize = AtomicUsize::new(0);

unsafe impl GlobalAlloc for Counting {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        ALLOCATIONS.fetch_add(1, Ordering::Relaxed);
        unsafe { System.alloc(layout) }
    }
    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        unsafe { System.dealloc(ptr, layout) }
    }
}

#[global_allocator]
static COUNTING: Counting = Counting;

#[test]
fn scanning_a_million_characters_allocates_nothing() {
    let input: String = (0..160_000u64).map(|n| format!("{n}\n")).collect();
    ALLOCATIONS.store(0, Ordering::Relaxed);

    let count = Tokens::new(&input).count();
    let mut sc = Scanner::new(&input);
    let mut sum = 0u64;
    while let Some(n) = sc.read::<u64>() {
        sum += n;
    }

    let allocations = ALLOCATIONS.load(Ordering::Relaxed);
    assert_eq!((count, sum), (160_000, 160_000 * 159_999 / 2));
    assert_eq!(allocations, 0, "scanning allocated {allocations} times");
}
