// The kit's tests. Don't edit them: make them pass.
use status::{describe, exit_code, exited, shell_code, term_signal};

#[test]
fn zero_means_exit_0() {
    assert!(exited(0), "status 0x0000: no signal, so it exited");
    assert_eq!(describe(0), "exit 0");
}

#[test]
fn the_exit_code_is_the_high_byte() {
    assert!(exited(0x0500), "status 0x0500: the low 7 bits are 0");
    assert_eq!(exit_code(0x0500), 5, "status 0x0500");
    assert_eq!(describe(0x0500), "exit 5");
}

#[test]
fn a_signal_is_the_low_7_bits() {
    assert!(!exited(9), "status 0x0009: SIGKILL killed it");
    assert_eq!(term_signal(9), 9, "status 0x0009");
    assert_eq!(describe(9), "signal 9");
}

#[test]
fn the_core_bit_is_not_part_of_the_signal() {
    assert_eq!(term_signal(0x8b), 11, "status 0x008b: SIGSEGV plus the core-dump bit 0x80");
    assert_eq!(describe(0x8b), "signal 11");
}

#[test]
fn every_exit_code_round_trips() {
    for code in 0..=255 {
        assert_eq!(describe(code << 8), format!("exit {code}"), "status {:#06x}", code << 8);
    }
}

#[test]
fn every_signal_round_trips() {
    for sig in 1..=31 {
        assert_eq!(describe(sig), format!("signal {sig}"), "status {sig:#06x}");
        assert_eq!(describe(sig | 0x80), format!("signal {sig}"), "status {:#06x}, with the core bit", sig | 0x80);
    }
}

#[test]
fn the_shell_adds_128_for_a_signal() {
    assert_eq!(shell_code(0x0300), 3, "exit 3: $? is 3");
    assert_eq!(shell_code(9), 137, "SIGKILL: $? is 128 + 9");
    assert_eq!(shell_code(0x8b), 139, "SIGSEGV with a core dump: $? is 128 + 11");
}
