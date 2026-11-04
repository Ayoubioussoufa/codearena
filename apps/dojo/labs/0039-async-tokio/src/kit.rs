//! Given: a CPU-heavy function, standing in for compiling a submission or
//! hashing a large output. It blocks its thread for 300 ms of real time.
pub fn slow_checksum(bytes: &[u8]) -> u64 {
    std::thread::sleep(std::time::Duration::from_millis(300));
    bytes.iter().fold(0xcbf29ce484222325, |h, &b| (h ^ b as u64).wrapping_mul(0x100000001b3))
}
