// ============================================================================
// MESSAGE OPCODES
// ============================================================================

struct (0x11111111) EnterLottery {
    sender: address
    amount: coins
}

struct (0x22222222) LotteryWin {
    amt: coins
}

struct (0x44444444) DrawWinner {
    queryId: uint64
}
